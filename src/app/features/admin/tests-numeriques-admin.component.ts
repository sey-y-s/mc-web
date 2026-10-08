import { Component, inject, signal } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AdminTestNumerique } from '../../core/services/admin.service';

@Component({
  selector: 'app-tests-numeriques-admin',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Tests numériques" description="Créer, modifier et gérer les tests, questions et propositions de réponse." />
    <section class="mc-card p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      <div class="overflow-x-auto">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Statut</th>
              <th>Questions</th>
            </tr>
          </thead>
          <tbody>
            @for (test of tests(); track test.id) {
              <tr>
                <td>{{ test.titre }}</td>
                <td><span class="badge">{{ test.statut }}</span></td>
                <td>{{ test.questions?.length ?? 0 }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class TestsNumeriquesAdminComponent {
  private readonly service = inject(AdminService);
  // tests: AdminTestNumerique[] = [];
  tests = signal<AdminTestNumerique[]>([]);
  error = '';

  constructor() {
    this.service.testsNumeriques().subscribe({
      next: (items) => {
        console.log("its fine");
        console.log(items);
        this.tests.set(items ?? []);
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les tests numériques.';
      },
    });
  }
}
