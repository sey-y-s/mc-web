import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';

interface CompetenceAdmin {
  id: string;
  nom: string;
  metierNom?: string;
  secteurNom?: string;
}

@Component({
  selector: 'app-referentiel-admin',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Référentiel" description="Gérer secteurs, métiers et compétences." />
    <section class="mc-card p-6">
      @if (error) {
        <p class="text-sm text-red-700" role="alert">{{ error }}</p>
      } @else if (loading) {
        <p class="text-sm text-slate-500">Chargement du référentiel…</p>
      } @else if (competences.length === 0) {
        <p class="text-sm text-slate-500">Aucune compétence n’est enregistrée dans le référentiel.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead><tr><th>Compétence</th><th>Métier</th><th>Secteur</th></tr></thead>
            <tbody>
              @for (competence of competences; track competence.id) {
                <tr><td>{{ competence.nom }}</td><td>{{ competence.metierNom || '—' }}</td><td>{{ competence.secteurNom || '—' }}</td></tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class ReferentielAdminComponent {
  private readonly service = inject(AdminService);
  competences: CompetenceAdmin[] = [];
  
  loading = true;
  error = '';

  constructor(private cdr: ChangeDetectorRef) {
    this.service.competences().subscribe({
      next: (competences) => {
        this.competences = competences;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger le référentiel.';
        this.loading = false;
      },
    });
  }
}
