import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AdminDashboard } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  private readonly service = inject(AdminService);

  readonly metricsResource = rxResource({
    stream: () => this.service.dashboard(),
  });

  readonly cards = [
    { key: 'citoyens', label: 'Citoyens', path: '/app/admin/citoyens', tone: 'neutral' },
    { key: 'organisations', label: 'Organisations', path: '/app/admin/organisations', tone: 'gold' },
    { key: 'validations', label: 'Validations', path: '/app/admin/validations', tone: 'neutral' },
    { key: 'tests', label: 'Tests numériques', path: '/app/admin/tests-numeriques', tone: 'neutral' },
    { key: 'besoins', label: 'Besoins', path: undefined, tone: 'neutral' },
    { key: 'misesEnRelation', label: 'Mises en relation', path: undefined, tone: 'neutral' },
  ] as const;

  metric(key: keyof AdminDashboard): number | null {
    const value = this.metricsResource.value()?.[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  errorMessage(): string {
    const err = this.metricsResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les indicateurs administratifs.';
  }
}
