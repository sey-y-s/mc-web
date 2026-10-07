import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';
import { Validation } from '../../shared/models';

@Component({
  selector: 'app-validations-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Validations" description="Consulter et gérer les validations." />
    <section class="mc-card p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>Libellé</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            @for (validation of validations; track validation.id) {
              <tr>
                <td>{{ validation.type }}</td>
                <td>{{ validation.libelle }}</td>
                <td>
                  <select class="mc-input" [ngModel]="validation.statut" (ngModelChange)="changerStatut(validation, $event)" [disabled]="pending.has(validation.id)" [attr.aria-label]="'Statut de la validation ' + validation.id">
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="APPROUVEE">Approuvée</option>
                    <option value="REJETEE">Rejetée</option>
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
export class ValidationsAdminComponent {
  private readonly service = inject(AdminService);
  validations: Validation[] = [];
  error = '';
  readonly pending = new Set<string>();

  constructor() {
    this.service.validations().subscribe({
      next: (items) => {
        this.validations = items ?? [];
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les validations.';
      },
    });
  }

  changerStatut(validation: Validation, statut: Validation['statut']): void {
    if (statut === validation.statut || this.pending.has(validation.id)) return;
    const ancienStatut = validation.statut;
    validation.statut = statut;
    this.pending.add(validation.id);
    this.error = '';
    this.service.modifierStatutValidation(validation.id, statut).subscribe({
      next: (updated) => {
        validation.statut = updated.statut;
        this.pending.delete(validation.id);
      },
      error: (error: Error) => {
        validation.statut = ancienStatut;
        this.pending.delete(validation.id);
        this.error = error.message || 'Impossible de modifier le statut de la validation.';
      },
    });
  }
}
