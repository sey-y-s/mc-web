import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, CitoyenAdmin } from '../../core/services/admin.service';

@Component({
  selector: 'app-citoyens-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Citoyens" description="Consulter les informations de synthèse autorisées. Les profils ne sont pas modifiables ici et aucun fichier de preuve n’est accessible." />
    <section class="mc-card p-5 sm:p-6">
      @if (citoyensResource.error()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <input class="mc-input" type="search" placeholder="Rechercher un citoyen" [ngModel]="recherche()" (ngModelChange)="recherche.set($event); page.set(1)" aria-label="Rechercher un citoyen" />
        <select class="mc-input" [ngModel]="disponibilite()" (ngModelChange)="disponibilite.set($event); page.set(1)" aria-label="Filtrer par disponibilité"><option value="">Toutes les disponibilités</option><option value="DISPONIBLE">Disponible</option><option value="OCCUPE">Occupé</option><option value="EN_APPRENTISSAGE">En apprentissage</option><option value="NON_DISPONIBLE">Non disponible</option></select>
      </div>
      <p class="mt-3 text-xs text-slate-500">Les informations présentées correspondent aux données disponibles pour chaque citoyen.</p>
      @if (citoyensResource.isLoading()) { <p class="py-8 text-sm text-slate-500" role="status">Chargement des citoyens…</p> }
      @else if (citoyensFiltres().length === 0) { <p class="py-8 text-sm text-slate-500">Aucun citoyen ne correspond aux filtres.</p> }
      @else {
        <div class="mt-4 overflow-x-auto"><table class="table w-full"><thead><tr><th>Citoyen</th><th>Disponibilité</th><th>Compte</th></tr></thead><tbody>
          @for (citoyen of pageItems(); track citoyen.id) { <tr><td><div class="font-medium">{{ citoyen.prenom }} {{ citoyen.nom }}</div></td><td>{{ labelDisponibilite(citoyen.disponibilite) }}</td><td><span class="text-sm text-slate-500">État du compte non exposé par l’API</span></td></tr> }
        </tbody></table></div>
        <div class="mt-4 flex items-center justify-between gap-3 text-sm"><span>{{ citoyensFiltres().length }} résultat(s) · Page {{ page() }} / {{ totalPages() }}</span><div class="flex gap-2"><button class="btn btn-secondary" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Précédent</button><button class="btn btn-secondary" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Suivant</button></div></div>
      }
    </section>
  `,
})
export class CitoyensAdminComponent {
  private readonly service = inject(AdminService);

  readonly recherche = signal('');
  readonly disponibilite = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly citoyensResource = rxResource({
    stream: () => this.service.citoyens(),
    defaultValue: [] as CitoyenAdmin[],
  });

  readonly citoyensFiltres = computed(() => {
    const q = this.recherche().trim().toLocaleLowerCase();
    const disp = this.disponibilite();
    const items = this.citoyensResource.value() ?? [];
    return items.filter(
      (c) =>
        (!disp || c.disponibilite === disp) &&
        (!q || `${c.nom} ${c.prenom}`.toLocaleLowerCase().includes(q))
    );
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.citoyensFiltres().length / this.pageSize))
  );

  readonly pageItems = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    return this.citoyensFiltres().slice((p - 1) * this.pageSize, p * this.pageSize);
  });

  errorMessage(): string {
    const err = this.citoyensResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les citoyens.';
  }

  labelDisponibilite(value?: string): string {
    return (
      ({
        DISPONIBLE: 'Disponible',
        OCCUPE: 'Occupé',
        EN_APPRENTISSAGE: 'En apprentissage',
        NON_DISPONIBLE: 'Non disponible',
      } as Record<string, string>)[value ?? ''] ?? 'Non renseignée'
    );
  }
}
