import { Component, OnInit, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { OrganisationService } from '../../core/services/organisation.service';
import { Organisation } from '../../shared/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-organisation-page',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './organisation-page.component.html',
})
export class OrganisationPageComponent implements OnInit {
  private readonly service = inject(OrganisationService);
  private readonly auth = inject(AuthService);

  organisation: Organisation | null = null;
  loading = true;
  error = '';

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
}
