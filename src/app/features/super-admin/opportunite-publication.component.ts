import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { OpportuniteService } from '../../core/services/opportunite.service';
import { Opportunite } from '../../shared/models';

@Component({
  selector: 'app-opportunite-publication',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Publication des opportunités" description="Suivre et gérer le cycle de publication des opportunités." />
    <section class="mc-card p-6">
      @if (error) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error }}</p> }
      @if (success) { <p class="mb-4 text-sm text-green-700" role="status">{{ success }}</p> }
      @if (loading) {
        <p class="text-sm text-slate-500">Chargement des opportunités…</p>
      } @else if (opportunites.length === 0) {
        <p class="text-sm text-slate-500">Aucune opportunité n’est enregistrée.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="table table-zebra w-full">
            <thead><tr><th>Titre</th><th>Type</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              @for (opportunite of opportunites; track opportunite.id) {
                <tr>
                  <td>{{ opportunite.titre }}</td>
                  <td>{{ opportunite.type }}</td>
                  <td><span class="badge">{{ opportunite.statut }}</span></td>
                  <td class="flex gap-2">
                    @if (opportunite.statut !== 'PUBLIEE') {
                      <button class="btn btn-sm btn-primary" [disabled]="pending.has(opportunite.id)" (click)="changerStatut(opportunite, 'publier')">Publier</button>
                    }
                    @if (opportunite.statut !== 'ARCHIVEE') {
                      <button class="btn btn-sm btn-outline" [disabled]="pending.has(opportunite.id)" (click)="changerStatut(opportunite, 'archiver')">Archiver</button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>
  `,
})
export class OpportunitePublicationComponent {
  private readonly service = inject(OpportuniteService);
  opportunites: Opportunite[] = [];
  loading = true;
  error = '';
  success = '';
  readonly pending = new Set<string>();

  constructor() {
    this.charger();
  }

  private charger(): void {
    this.loading = true;
    // this.service.lister().subscribe({
    //   next: (items) => {
    //     this.opportunites = items;
    //     this.loading = false;
    //   },
    //   error: (error: Error) => {
    //     this.error = error.message || 'Impossible de charger les opportunités.';
    //     this.loading = false;
    //   },
    // });
  }

  changerStatut(opportunite: Opportunite, action: 'publier' | 'archiver'): void {
    if (this.pending.has(opportunite.id)) return;
    this.pending.add(opportunite.id);
    this.error = '';
    this.success = '';
    // const request = action === 'publier'
    //   ? this.service.publier(opportunite.id)
    //   : this.service.archiver(opportunite.id);
    // request.subscribe({
    //   next: (updated) => {
    //     Object.assign(opportunite, updated);
    //     this.pending.delete(opportunite.id);
    //     this.success = action === 'publier'
    //       ? 'L’opportunité a été publiée.'
    //       : 'L’opportunité a été archivée.';
    //   },
    //   error: (error: Error) => {
    //     this.pending.delete(opportunite.id);
    //     this.error = error.message || 'Impossible de modifier le statut de l’opportunité.';
    //   },
    // });
  }
}
