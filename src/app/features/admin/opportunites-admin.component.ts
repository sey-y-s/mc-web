import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';
import { Opportunite } from '../../shared/models';

@Component({
  selector: 'app-opportunites-admin',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Opportunités" description="Consulter et gérer les opportunités." />
    <section class="mc-card p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Type</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (opportunite of opportunites; track opportunite.id) {
              <tr>
                <td>{{ opportunite.titre }}</td>
                <td>{{ opportunite.type }}</td>
                <td><span class="badge">{{ opportunite.statut }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class OpportunitesAdminComponent {
  private readonly service = inject(AdminService);
  opportunites: Opportunite[] = [];
  error = '';

  constructor(private cdr: ChangeDetectorRef) {
    this.service.opportunites().subscribe({
      next: (items) => {
        this.opportunites = items ?? [];
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les opportunités.';
      },
    });
  }
}
