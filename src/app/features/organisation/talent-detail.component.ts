import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { TalentService } from '../../core/services/talent.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { LibellePipe } from '../../shared/libelle.pipe';

@Component({
  selector: 'app-talent-detail',
  standalone: true,
  imports: [LibellePipe, PageHeaderComponent, RouterLink],
  templateUrl: './talent-detail.component.html',
})
export class TalentDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(TalentService);
  private readonly organisations = inject(OrganisationService);

  readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly talentResource = rxResource({
    params: () => ({
      id: this.id,
      statut: this.orgResource.value()?.statut,
    }),
    stream: ({ params }) => {
      if (!params.id || params.statut !== 'APPROUVEE') {
        return of(null);
      }
      return this.service.obtenir(params.id);
    },
  });

  readonly checkingAccess = computed(() => this.orgResource.isLoading());
  readonly loading = computed(() => this.talentResource.isLoading());

  readonly blocked = computed(() => {
    if (this.orgResource.isLoading()) return '';
    const statut = this.orgResource.value()?.statut;
    if (statut && statut !== 'APPROUVEE') {
      return 'L’organisation doit être validée pour consulter des profils de talents.';
    }
    return '';
  });

  readonly error = computed(() => {
    if (!this.id) return 'Identifiant opaque du talent manquant.';
    const orgErr = this.orgResource.error() as { message?: string } | undefined;
    if (orgErr) return orgErr.message || 'Impossible de vérifier le statut de l’organisation.';
    const talentErr = this.talentResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (talentErr) {
      return talentErr.error?.message ?? talentErr.message ?? 'Impossible de charger le profil anonymisé.';
    }
    return '';
  });
}
