import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';
import { Organisation } from '../../shared/models';

@Component({
  selector: 'app-organisations-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Organisations" description="Gérer les organisations et leur statut." />
    <section class="mc-card p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (organisation of organisations; track organisation.id) {
              <tr>
                <td>{{ organisation.nom }}</td>
                <td>{{ organisation.email || '-' }}</td>
                <td>
                  <select class="mc-input" [ngModel]="organisation.statut" (ngModelChange)="changerStatut(organisation, $event)" [disabled]="pending.has(organisation.id)" [attr.aria-label]="'Statut de ' + organisation.nom">
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="APPROUVEE">Approuvée</option>
                    <option value="REJETEE">Rejetée</option>
                    <option value="SUSPENDUE">Suspendue</option>
                  </select>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class OrganisationsAdminComponent {
  private readonly service = inject(AdminService);
  organisations: Organisation[] = [];
  error = '';
  readonly pending = new Set<string>();

  constructor() {
    this.service.organisations().subscribe({
      next: (items) => {
        this.organisations = items ?? [];
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les organisations.';
      },
    });
  }

  changerStatut(
    organisation: Organisation,
    statut: NonNullable<Organisation['statut']>,
  ): void {
    if (statut === organisation.statut || this.pending.has(organisation.id)) return;
    const ancienStatut = organisation.statut;
    organisation.statut = statut;
    this.pending.add(organisation.id);
    this.error = '';
    this.service.modifierStatutOrganisation(organisation.id, statut).subscribe({
      next: (updated) => {
        organisation.statut = updated.statut;
        this.pending.delete(organisation.id);
      },
      error: (error: Error) => {
        organisation.statut = ancienStatut;
        this.pending.delete(organisation.id);
        this.error = error.message || 'Impossible de modifier le statut de l’organisation.';
      },
    });
  }
}
