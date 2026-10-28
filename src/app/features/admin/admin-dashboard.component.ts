import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent, BarChartComponent, DonutChartComponent, ChartCategory, ChartSegment, MC_CHART } from '../../shared/components';
import { CarteMaliTalentsComponent } from '../carte/carte-mali-talents.component';
import { AdminService, AdminDashboard } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink, DatePipe, CarteMaliTalentsComponent, BarChartComponent, DonutChartComponent],
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

  /** Barre de répartition : part de chaque indicateur par rapport au plus élevé. */
  part(key: keyof AdminDashboard): number {
    const values = this.cards.map((c) => this.metric(c.key) ?? 0);
    const max = Math.max(1, ...values);
    return Math.round(((this.metric(key) ?? 0) / max) * 100);
  }

  /** Ratio arrondi à deux décimales, ou null si le dénominateur est nul. */
  ratio(a: keyof AdminDashboard, b: keyof AdminDashboard): string | null {
    const num = this.metric(a);
    const den = this.metric(b);
    if (num === null || !den) return null;
    return (num / den).toLocaleString('fr-FR', { maximumFractionDigits: 2 });
  }

  /** Histogramme : volume des actions menées sur la plateforme. */
  categoriesActivite(): ChartCategory[] {
    return this.cards
      .filter((c) => c.key !== 'citoyens' && c.key !== 'organisations')
      .map((c) => ({ label: c.label, values: [this.metric(c.key) ?? 0] }));
  }

  /** Anneau : comptes inscrits sur la plateforme. */
  segmentsComptes(): ChartSegment[] {
    return [
      { label: 'Citoyens', value: this.metric('citoyens') ?? 0, color: MC_CHART.vert },
      { label: 'Organisations', value: this.metric('organisations') ?? 0, color: MC_CHART.or },
    ];
  }

  readonly serieActivite = [{ name: 'Volume', color: MC_CHART.vert }];

  readonly derniereMiseAJour = signal(new Date());

  actualiser(): void {
    this.metricsResource.reload();
    this.derniereMiseAJour.set(new Date());
  }

  errorMessage(): string {
    const err = this.metricsResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les indicateurs administratifs.';
  }
}
