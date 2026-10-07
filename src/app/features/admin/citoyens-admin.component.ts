import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';
import { Talent } from '../../shared/models';

@Component({
  selector: 'app-citoyens-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Citoyens" description="Rechercher et consulter les citoyens." />
    <section class="mc-card p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      <input class="mc-input mb-4 max-w-md" type="search" placeholder="Rechercher par nom ou prénom" [(ngModel)]="recherche" aria-label="Rechercher un citoyen" />
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Disponibilité</th>
            </tr>
          </thead>
          <tbody>
            @for (citoyen of citoyensFiltres; track citoyen.id) {
              <tr>
                <td>{{ citoyen.nom }}</td>
                <td>{{ citoyen.prenom }}</td>
                <td>{{ citoyen.disponibilite || 'NC' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class CitoyensAdminComponent {
  private readonly service = inject(AdminService);
  citoyens: Talent[] = [];
  recherche = '';
  error = '';

  get citoyensFiltres(): Talent[] {
    const query = this.recherche.trim().toLocaleLowerCase();
    if (!query) return this.citoyens;
    return this.citoyens.filter((citoyen) =>
      `${citoyen.nom} ${citoyen.prenom ?? ''}`.toLocaleLowerCase().includes(query),
    );
  }

  constructor() {
    this.service.citoyens().subscribe({
      next: (items) => {
        this.citoyens = items ?? [];
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les citoyens.';
      },
    });
  }
}
