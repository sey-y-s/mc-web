import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { OrganisationService } from '../../core/services/organisation.service';

@Component({
  selector: 'app-organisation-profile',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './organisation-profile.component.html',
})
export class OrganisationProfileComponent {
  private readonly service = inject(OrganisationService);

  readonly organisationResource = rxResource({
    stream: () => this.service.obtenirPourUtilisateur(),
  });

  readonly editNom = signal('');
  readonly editDescription = signal('');
  readonly editNumeroRccm = signal('');

  constructor() {
    effect(() => {
      const org = this.organisationResource.value();
      if (org) {
        this.editNom.set(org.nom ?? '');
        this.editDescription.set(org.description ?? '');
        this.editNumeroRccm.set(org.numeroRccm ?? '');
      }
    });
  }

  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly success = signal('');

  readonly champsManquants = computed(() => {
    const org = this.organisationResource.value();
    if (!org) return ['Nom', 'Description'];
    const missing: string[] = [];
    if (!this.editNom().trim()) missing.push('Nom de l’organisation');
    if (!this.editDescription().trim()) missing.push('Description');
    return missing;
  });

  readonly completion = computed(() => {
    return Math.round(((2 - this.champsManquants().length) / 2) * 100);
  });

  readonly statutLabel = computed(() => {
    switch (this.organisationResource.value()?.statut) {
      case 'APPROUVEE': return 'Validée';
      case 'EN_ATTENTE': return 'En attente de validation';
      case 'REJETEE': return 'Refusée';
      case 'SUSPENDUE': return 'Suspendue';
      default: return 'Non renseigné';
    }
  });

  errorMessage(): string {
    const err = this.organisationResource.error() as { message?: string } | undefined;
    return this.saveError() || err?.message || 'Impossible de charger le profil organisation.';
  }

  save(): void {
    const org = this.organisationResource.value();
    if (!org || this.saving() || !this.editNom().trim()) return;
    this.saving.set(true);
    this.saveError.set('');
    this.success.set('');

    this.service
      .modifierMonProfil({
        nom: this.editNom().trim(),
        description: this.editDescription().trim(),
        numeroRccm: this.editNumeroRccm().trim(),
      })
      .subscribe({
        next: () => {
          this.success.set('Le profil a été enregistré.');
          this.saving.set(false);
          this.organisationResource.reload();
        },
        error: (error: { message?: string }) => {
          this.saveError.set(error.message || 'Impossible d’enregistrer le profil.');
          this.saving.set(false);
        },
      });
  }
}
