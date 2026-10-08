import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';

interface AdminDashboardMetrics {
  citoyens: number;
  organisations: number;
  validations: number;
  tests: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private readonly service = inject(AdminService);
  metrics: AdminDashboardMetrics = { citoyens: 0, organisations: 0, validations: 0, tests: 0 };
  error = '';

  ngOnInit(): void {
    this.service.dashboard().subscribe({
      next: (value) => {
        this.metrics = {
          citoyens: value['citoyens'] ?? 0,
          organisations: value['organisations'] ?? 0,
          validations: value['validations'] ?? 0,
          tests: value['tests'] ?? 0,
        };
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les indicateurs globaux.';
      },
    });
  }
}
