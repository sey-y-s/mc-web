import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent, StatusBadgeComponent } from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';
import { LibellePipe } from '../../shared/libelle.pipe';

@Component({
  selector: 'app-besoin-detail',
  standalone: true,
  imports: [LibellePipe, DatePipe, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './besoin-detail.component.html',
})
export class BesoinDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(BesoinService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly organisations = inject(OrganisationService);

  readonly id = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly clotureEnCours = signal(false);
  readonly message = signal('');
  readonly clotureError = signal('');

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly besoinResource = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.service.obtenir(params),
  });

  readonly organisationApprouvee = computed(() => {
    return this.orgResource.value()?.statut === 'APPROUVEE';
  });

  errorMessage(): string {
    if (this.clotureError()) return this.clotureError();
    const err = this.besoinResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? 'Impossible de charger ce besoin.';
  }

  async cloturer(): Promise<void> {
    const b = this.besoinResource.value();
    if (!b || this.clotureEnCours()) return;
    const ok = await this.confirmation.confirm('Clôturer définitivement ce besoin ? Il ne sera plus ouvert aux candidatures.', { title: 'Clôturer le besoin', confirmLabel: 'Clôturer', danger: true });
    if (!ok || this.clotureEnCours()) return;
    this.clotureEnCours.set(true);
    this.clotureError.set('');
    this.service.cloturer(b.id).subscribe({
      next: () => {
        this.message.set('Le besoin a été clôturé.');
        this.clotureEnCours.set(false);
        this.besoinResource.reload();
      },
      error: (e) => {
        this.clotureError.set(e?.error?.message ?? e?.message ?? 'Impossible de clôturer le besoin.');
        this.clotureEnCours.set(false);
      },
    });
  }
}
