import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService } from '../../core/services/admin.service';
import { Opportunite } from '../../shared/models';

@Component({
  selector: 'app-opportunites-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Opportunités" description="Consultation en lecture seule pour l’ADMIN. La publication et les modifications sont réservées au SUPER_ADMIN." />
    <section class="mc-card p-5 sm:p-6">
      @if (opportunitesResource.error()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      <div class="mb-4 flex flex-wrap gap-3"><input class="mc-input max-w-sm" type="search" [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="Rechercher une opportunité" aria-label="Rechercher une opportunité" /><select class="mc-input max-w-xs" [ngModel]="filter()" (ngModelChange)="filter.set($event)" aria-label="Filtrer par statut"><option value="">Tous les statuts</option><option value="BROUILLON">Brouillon</option><option value="PUBLIEE">Publiée</option><option value="EXPIREE">Expirée</option><option value="ARCHIVEE">Archivée</option></select></div>
      @if (opportunitesResource.isLoading()) { <p class="py-8 text-sm text-slate-500">Chargement des opportunités…</p> } @else if (!filtered().length) { <p class="py-8 text-sm text-slate-500">Aucune opportunité disponible pour ces filtres.</p> } @else { <div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Titre</th><th>Catégorie</th><th>Type</th><th>Statut</th><th>Expiration</th></tr></thead><tbody>@for (o of filtered(); track o.id) { <tr><td class="font-medium">{{ o.titre }}</td><td>{{ o.categorieNom || '—' }}</td><td>{{ o.type }}</td><td>{{ o.statut }}</td><td>{{ o.dateExpiration || '—' }}</td></tr> }</tbody></table></div> }
    </section>
  `,
})
export class OpportunitesAdminComponent {
  private readonly service = inject(AdminService);

  readonly query = signal('');
  readonly filter = signal('');

  readonly opportunitesResource = rxResource({
    stream: () => this.service.opportunites(),
    defaultValue: [] as Opportunite[],
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const flt = this.filter();
    const list = this.opportunitesResource.value() ?? [];
    return list.filter(
      (o) =>
        (!flt || o.statut === flt) &&
        (!q || `${o.titre} ${o.description ?? ''} ${o.categorieNom ?? ''}`.toLocaleLowerCase().includes(q))
    );
  });

  errorMessage(): string {
    const err = this.opportunitesResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les opportunités.';
  }
}
