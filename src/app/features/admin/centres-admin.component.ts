import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';

interface CentreAdmin {
  id: string;
  nom: string;
  adresse?: string;
  telephone?: string;
}

@Component({
  selector: 'app-centres-admin',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Centres d'évaluation" description="Gérer les centres d'évaluation." />
    <section class="mc-card p-6">
      @if (error) {
        <p class="text-sm text-red-700" role="alert">{{ error }}</p>
      } @else if (loading) {
        <p class="text-sm text-slate-500">Chargement des centres…</p>
      } @else if (centres.length === 0) {
        <p class="text-sm text-slate-500">Aucun centre d'évaluation enregistré.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead><tr><th>Centre</th><th>Adresse</th><th>Téléphone</th></tr></thead>
            <tbody>
              @for (centre of centres; track centre.id) {
                <tr><td>{{ centre.nom }}</td><td>{{ centre.adresse || '—' }}</td><td>{{ centre.telephone || '—' }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class CentresAdminComponent {
  private readonly service = inject(AdminService);
  centres: CentreAdmin[] = [];
  loading = true;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {
    this.service.centres().subscribe({
      next: (centres) => {
        this.centres = centres;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les centres.';
        this.loading = false;
      },
    });
  }
}
