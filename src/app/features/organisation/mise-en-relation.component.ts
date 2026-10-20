import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, of, switchMap, map, catchError } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { MiseEnRelationService } from '../../core/services/mise-en-relation.service';
import { SuiviBesoinTalentService } from '../../core/services/suivi-besoin-talent.service';
import { TalentService } from '../../core/services/talent.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { DemandeMiseEnRelation, SuiviBesoinTalent } from '../../shared/models';

export interface DemandeWithPseudo extends DemandeMiseEnRelation {
  pseudoTalent?: string;
}

@Component({
  selector: 'app-mise-en-relation',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './mise-en-relation.component.html',
})
export class MiseEnRelationComponent {
  private readonly service = inject(MiseEnRelationService);
  private readonly suiviService = inject(SuiviBesoinTalentService);
  private readonly talents = inject(TalentService);
  private readonly organisations = inject(OrganisationService);
  private readonly route = inject(ActivatedRoute);

  private readonly queryParams = toSignal(this.route.queryParamMap);
  readonly suiviId = computed(() => this.queryParams()?.get('suiviId') ?? '');

  readonly message = signal('');
  readonly sending = signal(false);
  readonly actionError = signal('');
  readonly success = signal('');

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly organisationApprouvee = computed(() => this.orgResource.value()?.statut === 'APPROUVEE');
  readonly checkingAccess = computed(() => this.orgResource.isLoading());

  readonly suiviResource = rxResource({
    params: () => this.suiviId(),
    stream: ({ params: id }) => {
      if (!id) return of(null);
      return this.suiviService.obtenir(id).pipe(
        switchMap((suivi) =>
          this.talents.obtenir(suivi.citoyenId).pipe(
            map((talent) => ({ suivi, talentPseudo: talent.pseudo || 'Profil anonymisé' })),
            catchError(() => of({ suivi, talentPseudo: 'Profil anonymisé' }))
          )
        )
      );
    },
  });

  readonly suivi = computed(() => this.suiviResource.value()?.suivi ?? null);
  readonly talentPseudo = computed(() => this.suiviResource.value()?.talentPseudo ?? '');
  readonly followupError = computed(() => {
    const err = this.suiviResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err ? (err.error?.message ?? err.message ?? 'Impossible de charger le suivi sélectionné.') : '';
  });

  readonly demandesResource = rxResource({
    stream: () =>
      this.service.lister().pipe(
        switchMap((items) => {
          if (!items || items.length === 0) return of([] as DemandeWithPseudo[]);
          const queries = items.map((demande) => {
            const id = demande.suiviBesoinTalentId;
            if (!id) return of({ ...demande, pseudoTalent: 'Profil anonymisé' });
            return this.suiviService.obtenir(id).pipe(
              switchMap((suivi) =>
                this.talents.obtenir(suivi.citoyenId).pipe(
                  map((talent) => ({ ...demande, pseudoTalent: talent.pseudo || 'Profil anonymisé' })),
                  catchError(() => of({ ...demande, pseudoTalent: 'Profil anonymisé' }))
                )
              ),
              catchError(() => of({ ...demande, pseudoTalent: 'Profil anonymisé' }))
            );
          });
          return forkJoin(queries);
        })
      ),
    defaultValue: [] as DemandeWithPseudo[],
  });

  readonly demandes = computed(() => this.demandesResource.value() ?? []);
  readonly loading = computed(() => this.demandesResource.isLoading());

  readonly error = computed(() => {
    if (this.actionError()) return this.actionError();
    const orgErr = this.orgResource.error() as { message?: string } | undefined;
    if (orgErr) return orgErr.message || 'Impossible de vérifier le statut de l’organisation.';
    const dErr = this.demandesResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (dErr)
      return dErr.error?.message ?? dErr.message ?? 'Impossible de charger les demandes de mise en relation.';
    return '';
  });

  readonly messageValide = computed(
    () => this.message().trim().length >= 20 && this.message().trim().length <= 500
  );

  chargerDemandes(): void {
    this.demandesResource.reload();
  }

  envoyer(): void {
    if (!this.organisationApprouvee()) {
      this.actionError.set('La demande de mise en relation est réservée aux organisations validées.');
      return;
    }
    const currentSuivi = this.suivi();
    if (!currentSuivi || !this.suiviId()) {
      this.actionError.set('Une demande doit être initiée depuis un talent déjà suivi.');
      return;
    }
    if (!this.messageValide()) {
      this.actionError.set('Le message doit contenir entre 20 et 500 caractères.');
      return;
    }
    if (this.sending()) return;
    this.sending.set(true);
    this.actionError.set('');
    this.success.set('');
    this.service
      .creer({
        destinataireId: currentSuivi.citoyenId,
        suiviBesoinTalentId: currentSuivi.id,
        message: this.message().trim(),
      })
      .subscribe({
        next: () => {
          this.message.set('');
          this.success.set('La demande a été transmise au serveur.');
          this.sending.set(false);
          this.demandesResource.reload();
        },
        error: (e: { error?: { message?: string }; message?: string }) => {
          this.actionError.set(e.error?.message ?? e.message ?? 'Impossible d’envoyer la demande.');
          this.sending.set(false);
        },
      });
  }

  pseudo(demande: DemandeWithPseudo): string {
    return demande.pseudoTalent || 'Profil anonymisé';
  }
}
