import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components';
import { OrganisationService } from '../../core/services/organisation.service';
import { OrganisationDashboardMetrics } from '../../shared/models';

@Component({
  selector: 'app-organisation-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './organisation-dashboard.component.html',
})
export class OrganisationDashboardComponent implements OnInit {
  private readonly service = inject(OrganisationService);
  metrics: OrganisationDashboardMetrics | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.error = '';
    this.service.dashboard().subscribe({
      next: (value) => {
        this.metrics = value;
        this.loading = false;
      },
      error: (error) => {
        this.error = error?.error?.message ?? error?.message ??
          'Les indicateurs ne sont pas disponibles pour le moment. Réessayez ultérieurement.';
        this.loading = false;
      },
    });
  }
}
