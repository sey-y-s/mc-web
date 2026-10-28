import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { forkJoin, of, switchMap, map, catchError } from 'rxjs';
import { BesoinService } from '../../core/services/besoin.service';
import { SuiviBesoinTalentService } from '../../core/services/suivi-besoin-talent.service';
import { TalentService } from '../../core/services/talent.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { Besoin, SuiviBesoinTalent } from '../../shared/models';
import { PageHeaderComponent } from '../../shared/components';
import { LibellePipe } from '../../shared/libelle.pipe';

const STATUSES: SuiviBesoinTalent['statut'][] = ['A_L_ETUDE', 'CONTACT_EN_COURS', 'MISE_EN_RELATION', 'ARCHIVE'];

@Component({
  selector: 'app-suivi-besoin-talent',
  standalone: true,
  imports: [LibellePipe, DatePipe, FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './suivi-besoin-talent.component.html',
})
export class SuiviBesoinTalentComponent {
  private readonly besoinsService = inject(BesoinService);
  private readonly service = inject(SuiviBesoinTalentService);
  private readonly talents = inject(TalentService);
  private readonly organisations = inject(OrganisationService);

  readonly statuses = STATUSES;
  readonly pending = new Set<string>();
  readonly noteDrafts: Record<string, string> = {};
  readonly selectedBesoinId = signal<string>('');
  readonly actionError = signal<string>('');

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly organisationId = computed(() => this.orgResource.value()?.id ?? '');
  readonly organisationApprouvee = computed(() => this.orgResource.value()?.statut === 'APPROUVEE');
  readonly accessError = computed(() => {
    const err = this.orgResource.error() as { message?: string } | undefined;
    return err ? (err.message || 'Impossible de vérifier le profil organisation.') : '';
  });

  readonly besoinsResource = rxResource({
    stream: () => this.besoinsService.lister(),
    defaultValue: [] as Besoin[],
  });

  readonly besoins = computed(() => this.besoinsResource.value() ?? []);

  readonly currentBesoinId = computed(() => {
    const chosen = this.selectedBesoinId();
    if (chosen) return chosen;
    const list = this.besoins();
    const preferred = list.find((b) => b.statut === 'OUVERT') ?? list[0];
    return preferred?.id ?? '';
  });

  readonly suiviResource = rxResource({
    params: () => this.currentBesoinId(),
    stream: ({ params: besoinId }) => {
      if (!besoinId) return of([] as SuiviBesoinTalent[]);
      return this.service.listerPourBesoin(besoinId).pipe(
        switchMap((items) => {
          if (!items || items.length === 0) return of([] as SuiviBesoinTalent[]);
          const queries = items.map((row) =>
            this.talents.obtenir(row.citoyenId).pipe(
              map((talent) => ({ ...row, pseudo: talent.pseudo || 'Profil anonymisé' })),
              catchError(() => of({ ...row, pseudo: 'Profil anonymisé' }))
            )
          );
          return forkJoin(queries);
        })
      );
    },
    defaultValue: [] as SuiviBesoinTalent[],
  });

  readonly loading = computed(
    () => this.orgResource.isLoading() || this.besoinsResource.isLoading() || this.suiviResource.isLoading()
  );

  readonly error = computed(() => {
    if (this.actionError()) return this.actionError();
    const bErr = this.besoinsResource.error() as { error?: { message?: string }; message?: string } | undefined;
    if (bErr) return bErr.error?.message ?? bErr.message ?? 'Impossible de charger les besoins.';
    const sErr = this.suiviResource.error() as { error?: { message?: string }; message?: string } | undefined;
    if (sErr) return sErr.error?.message ?? sErr.message ?? 'Impossible de charger les suivis de ce besoin.';
    return '';
  });

  readonly rows = computed(() => this.suiviResource.value() ?? []);

  readonly rowsParStatut = computed<Record<SuiviBesoinTalent['statut'], SuiviBesoinTalent[]>>(() => {
    const list = this.rows();
    return {
      A_L_ETUDE: list.filter((r) => r.statut === 'A_L_ETUDE'),
      CONTACT_EN_COURS: list.filter((r) => r.statut === 'CONTACT_EN_COURS'),
      MISE_EN_RELATION: list.filter((r) => r.statut === 'MISE_EN_RELATION'),
      ARCHIVE: list.filter((r) => r.statut === 'ARCHIVE'),
    };
  });

  changerBesoin(id: string): void {
    this.selectedBesoinId.set(id);
  }

  chargerPourBesoin(): void {
    this.actionError.set('');
    this.besoinsResource.reload();
    this.suiviResource.reload();
  }

  changerStatut(row: SuiviBesoinTalent, statut: SuiviBesoinTalent['statut']): void {
    if (statut === row.statut || this.pending.has(row.id)) return;
    this.pending.add(row.id);
    this.actionError.set('');
    this.service
      .mettreAJour(row.id, {
        organisationId: this.organisationId(),
        besoinId: row.besoinId,
        citoyenId: row.citoyenId,
        statut,
        noteInterne: this.noteDrafts[row.id] ?? row.noteInterne,
      })
      .subscribe({
        next: () => {
          this.pending.delete(row.id);
          this.suiviResource.reload();
        },
        error: (e: { error?: { message?: string }; message?: string }) => {
          this.pending.delete(row.id);
          this.actionError.set(e.error?.message ?? e.message ?? 'Impossible de mettre à jour le suivi.');
        },
      });
  }

  enregistrerNote(row: SuiviBesoinTalent): void {
    if (this.pending.has(row.id)) return;
    this.pending.add(row.id);
    this.actionError.set('');
    this.service
      .mettreAJour(row.id, {
        organisationId: this.organisationId(),
        besoinId: row.besoinId,
        citoyenId: row.citoyenId,
        statut: row.statut,
        noteInterne: this.noteDrafts[row.id] ?? row.noteInterne ?? '',
      })
      .subscribe({
        next: () => {
          this.pending.delete(row.id);
          this.suiviResource.reload();
        },
        error: (e: { error?: { message?: string }; message?: string }) => {
          this.pending.delete(row.id);
          this.actionError.set(e.error?.message ?? e.message ?? 'Impossible d’enregistrer la note interne.');
        },
      });
  }

  statutLabel(status: SuiviBesoinTalent['statut']): string {
    return (
      {
        A_L_ETUDE: 'À l’étude',
        CONTACT_EN_COURS: 'Contact en cours',
        MISE_EN_RELATION: 'Mise en relation',
        ARCHIVE: 'Archivé',
      }[status] ?? status
    );
  }

  previous(status: SuiviBesoinTalent['statut']): SuiviBesoinTalent['statut'] | null {
    const i = STATUSES.indexOf(status);
    return i > 0 ? STATUSES[i - 1] : null;
  }

  next(status: SuiviBesoinTalent['statut']): SuiviBesoinTalent['statut'] | null {
    const i = STATUSES.indexOf(status);
    return i < STATUSES.length - 1 ? STATUSES[i + 1] : null;
  }
}
