import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { OrganisationService } from '../../core/services/organisation.service';
import { Organisation } from '../../shared/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-organisation-profile',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './organisation-profile.component.html',
})
export class OrganisationProfileComponent implements OnInit {
  private readonly service = inject(OrganisationService);
  private readonly auth = inject(AuthService);

  organisation: Organisation | null = null;
  loading = true;
  saving = false;
  error = '';
  success = '';

  ngOnInit(): void {
    if (!this.auth.getCurrentUser()?.id) {
      this.error = 'Compte connecté introuvable. Veuillez vous reconnecter.';
      this.loading = false;
      return;
    }

    this.service.obtenirPourUtilisateur().subscribe({
      next: (organisation) => {
        this.organisation = organisation;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les informations de l’organisation.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (!this.organisation) return;

    this.saving = true;
    this.error = '';
    this.success = '';
    this.service.modifier(this.organisation.id, this.organisation).subscribe({
      next: (value) => {
        this.organisation = value;
        this.success = 'Les informations de l’organisation ont été enregistrées.';
        this.saving = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible d’enregistrer les modifications.';
        this.saving = false;
      },
    });
  }
}
