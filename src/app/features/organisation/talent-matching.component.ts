import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { MatchingService, MatchingResult } from '../../core/services/matching.service';
import { SuiviBesoinTalentService } from '../../core/services/suivi-besoin-talent.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { BesoinService } from '../../core/services/besoin.service';

@Component({
  selector: 'app-talent-matching',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, RouterLink],
  templateUrl: './talent-matching.component.html',
})
export class TalentMatchingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(MatchingService);
  private readonly suiviService = inject(SuiviBesoinTalentService);
  private readonly organisations = inject(OrganisationService);
  private readonly besoins = inject(BesoinService);

  readonly filter = signal('');
  readonly minimumScore = signal(0);
  readonly sortOrder = signal<'desc' | 'asc'>('desc');
  readonly actionError = signal('');
  readonly actionMessage = signal('');
  readonly pendingActions = new Set<string>();
  readonly completedActions = new Set<string>();

  readonly besoinId = signal(this.route.snapshot.paramMap.get('besoinId') ?? '');

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly besoinResource = rxResource({
    params: () => this.besoinId(),
    stream: ({ params }) => (params ? this.besoins.obtenir(params) : of(null)),
  });

  readonly matchingResource = rxResource({
    params: () => ({
      besoinId: this.besoinId(),
      orgStatut: this.orgResource.value()?.statut,
      besoinStatut: this.besoinResource.value()?.statut,
    }),
    stream: ({ params }) => {
      if (
        !params.besoinId ||
        params.orgStatut !== 'APPROUVEE' ||
        params.besoinStatut !== 'OUVERT'
      ) {
        return of([] as MatchingResult[]);
      }
      return this.service.listerPourBesoin(params.besoinId);
    },
    defaultValue: [] as MatchingResult[],
  });

  readonly loading = computed(
    () =>
      this.orgResource.isLoading() ||
      this.besoinResource.isLoading() ||
      this.matchingResource.isLoading()
  );

  readonly blockedReason = computed(() => {
    if (this.orgResource.isLoading() || this.besoinResource.isLoading()) return '';
    const org = this.orgResource.value();
    if (org && org.statut !== 'APPROUVEE') {
      return 'La recherche de correspondances est réservée aux organisations validées.';
    }
    const besoin = this.besoinResource.value();
    if (besoin && besoin.statut !== 'OUVERT') {
      return 'Le matching est disponible uniquement pour un besoin ouvert.';
    }
    return '';
  });

  readonly error = computed(() => {
    if (!this.besoinId()) return 'Identifiant du besoin manquant.';
    const orgErr = this.orgResource.error() as { message?: string } | undefined;
    if (orgErr) return orgErr.message || 'Impossible de vérifier le statut de l’organisation.';
    const bErr = this.besoinResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (bErr) return bErr.error?.message ?? bErr.message ?? 'Impossible de vérifier le besoin.';
    const mErr = this.matchingResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (mErr)
      return mErr.error?.message ?? mErr.message ?? 'Impossible de charger les correspondances.';
    return '';
  });

  readonly items = computed(() => this.matchingResource.value() ?? []);

  readonly resultatsFiltres = computed(() => {
    const query = this.filter().trim().toLocaleLowerCase();
    const min = this.minimumScore();
    const order = this.sortOrder();
    return this.items()
      .filter((item) => item.score >= min)
      .filter(
        (item) =>
          !query ||
          [
            item.talent?.pseudo,
            item.talent?.metierNom,
            item.talent?.localisation,
            ...(item.talent?.competences?.map((c) => c.nom) ?? []),
            ...(item.competencesCorrespondantes ?? []),
            ...(item.competencesManquantes ?? []),
          ].some((v) => v?.toLowerCase().includes(query))
      )
      .sort((a, b) => (order === 'desc' ? b.score - a.score : a.score - b.score));
  });

  reessayer(): void {
    this.orgResource.reload();
    this.besoinResource.reload();
    this.matchingResource.reload();
  }

  suivre(item: MatchingResult): void {
    const key = `suivi:${item.talentId}`;
    if (this.pendingActions.has(key) || this.completedActions.has(key)) return;
    this.pendingActions.add(key);
    this.actionError.set('');
    this.actionMessage.set('');
    const orgId = this.orgResource.value()?.id ?? '';
    const bId = this.besoinId();

    this.suiviService
      .creer({
        organisationId: orgId,
        besoinId: bId,
        citoyenId: item.talentId,
        statut: 'A_L_ETUDE',
        scoreCorrespondance: item.score,
        detailsCorrespondance: `${(item.competencesCorrespondantes ?? []).join(', ')} | manquantes: ${(item.competencesManquantes ?? []).join(', ')}`,
      })
      .subscribe({
        next: () => {
          this.pendingActions.delete(key);
          this.completedActions.add(key);
          this.actionMessage.set('Talent ajouté au suivi.');
        },
        error: (e: HttpErrorResponse) => {
          this.pendingActions.delete(key);
          this.actionError.set(
            e.error?.message ??
              (e.status === 409
                ? 'Ce talent est déjà suivi pour ce besoin.'
                : e.message) ??
              'Impossible d’ajouter ce talent au suivi.'
          );
        },
      });
  }
}
