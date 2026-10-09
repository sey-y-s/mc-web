import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { OrganisationService } from '../../core/services/organisation.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-organisation-page',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './organisation-page.component.html',
})
export class OrganisationPageComponent {
  private readonly service = inject(OrganisationService);
  private readonly auth = inject(AuthService);

  // Déclaration de la ressource asynchrone gérée par les Signals
  organisationResource = rxResource({
    stream: () => {
      if (!this.auth.getCurrentUser()?.id) {
        throw new Error('Compte connecté introuvable. Veuillez vous reconnecter.');
      }
      return this.service.obtenirPourUtilisateur();
    },
  });
}