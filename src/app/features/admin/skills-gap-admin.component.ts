import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { SkillsGapService } from '../../core/services/skills-gap.service';
import { SkillsGap } from '../../shared/models';

@Component({
  selector: 'app-skills-gap-admin',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Skills-Gap" description="Afficher les indicateurs Skills-Gap et la répartition territoriale." />
    <section class="mc-card p-6">
      @if (error) {
        <p class="text-sm text-red-700" role="alert">{{ error }}</p>
      } @else if (loading) {
        <p class="text-sm text-slate-500">Chargement des indicateurs…</p>
      } @else if (indicateurs.length === 0) {
        <p class="text-sm text-slate-500">Aucun indicateur Skills-Gap n’est disponible.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead><tr><th>Compétence</th><th>Territoire</th><th>Demande</th><th>Offre</th><th>Écart</th></tr></thead>
            <tbody>
              @for (item of indicateurs; track item.id) {
                <tr>
                  <td>{{ item.competenceNom || item.competenceId }}</td>
                  <td>{{ item.regionNom || item.regionId }}</td>
                  <td>{{ item.demandeEstimee }}</td>
                  <td>{{ item.offreDisponible }}</td>
                  <td>{{ item.ecart }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class SkillsGapAdminComponent {
  private readonly service = inject(SkillsGapService);
  indicateurs: SkillsGap[] = [];
  loading = true;
  error = '';

  constructor() {
    this.service.lister().subscribe({
      next: (items) => {
        this.indicateurs = items;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les indicateurs Skills-Gap.';
        this.loading = false;
      },
    });
  }
}
