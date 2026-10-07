import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-audit-admin',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Audit" description="Afficher les consultations, actions et événements importants de la plateforme." />
    <section class="mc-card p-6">
      <p class="text-sm text-amber-800" role="status">
        Aucun journal d’audit n’est disponible dans le backend. Les événements ne sont pas simulés
        ni reconstruits à partir d’autres données.
      </p>
    </section>
  `,
})
export class AuditAdminComponent {}
