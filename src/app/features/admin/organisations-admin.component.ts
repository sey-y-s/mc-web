import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, OrganisationAdmin } from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';

@Component({
  selector: 'app-organisations-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Organisations" description="Examinez les dossiers et enregistrez votre décision." />
    <section class="mc-card p-5 sm:p-6">
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }
      @if (organisationsResource.error() || actionError()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      <div class="mb-4 flex flex-col gap-3 md:flex-row"><input class="mc-input md:max-w-sm" type="search" [ngModel]="recherche()" (ngModelChange)="recherche.set($event); page.set(1)" placeholder="Rechercher une organisation" aria-label="Rechercher une organisation" /><select class="mc-input md:max-w-xs" [ngModel]="filtre()" (ngModelChange)="filtre.set($event); page.set(1)" aria-label="Filtrer par statut"><option value="">Tous les statuts</option><option value="EN_ATTENTE">En attente</option><option value="APPROUVEE">Approuvée</option><option value="REJETEE">Rejetée</option><option value="SUSPENDUE">Suspendue</option></select></div>
      @if (organisationsResource.isLoading()) { <p class="py-8 text-sm text-slate-500" role="status">Chargement des organisations…</p> }
      @else if (items().length === 0) { <p class="py-8 text-sm text-slate-500">Aucune organisation ne correspond aux filtres.</p> }
      @else { <div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Organisation</th><th>Contact déclaré</th><th>RCCM</th><th>Statut</th><th>Décisions</th></tr></thead><tbody>
        @for (item of pageItems(); track item.id) { <tr><td><div class="font-semibold">{{ item.nom }}</div><p class="max-w-lg text-xs text-slate-500">{{ item.description || 'Aucune description' }}</p></td><td>{{ item.email || 'Non communiqué' }}</td><td class="font-mono text-xs">{{ item.numeroRccm || 'Non renseigné' }}</td><td><span class="badge" [class.badge-warning]="item.statut === 'EN_ATTENTE'">{{ labelStatut(item.statut) }}</span></td><td><div class="flex flex-wrap gap-2"><button class="btn btn-secondary" [disabled]="pending.has(item.id) || item.statut === 'APPROUVEE'" (click)="decider(item, 'APPROUVEE')">Approuver</button><button class="btn btn-secondary" [disabled]="pending.has(item.id) || item.statut === 'SUSPENDUE'" (click)="decider(item, 'SUSPENDUE')">Suspendre</button><button class="btn btn-secondary" [disabled]="pending.has(item.id) || item.statut === 'REJETEE'" (click)="decider(item, 'REJETEE')">Rejeter</button></div></td></tr> }
      </tbody></table></div><div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{{ items().length }} résultat(s) · Page {{ page() }} / {{ totalPages() }}</span><div class="flex gap-2"><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Précédent</button><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Suivant</button></div></div> }
    </section>
  `,
})
export class OrganisationsAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);

  readonly recherche = signal('');
  readonly filtre = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly message = signal('');
  readonly actionError = signal('');
  readonly pending = new Set<string>();

  readonly organisationsResource = rxResource({
    stream: () => this.service.organisations(),
    defaultValue: [] as OrganisationAdmin[],
  });

  readonly items = computed(() => {
    const q = this.recherche().trim().toLocaleLowerCase();
    const flt = this.filtre();
    const list = this.organisationsResource.value() ?? [];
    return list
      .filter(
        (o) =>
          (!flt || o.statut === flt) &&
          (!q || `${o.nom} ${o.email ?? ''} ${o.numeroRccm ?? ''}`.toLocaleLowerCase().includes(q))
      )
      .sort(
        (a, b) =>
          Number(b.statut === 'EN_ATTENTE') - Number(a.statut === 'EN_ATTENTE') ||
          a.nom.localeCompare(b.nom)
      );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.items().length / this.pageSize)));

  readonly pageItems = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    return this.items().slice((p - 1) * this.pageSize, p * this.pageSize);
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.organisationsResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les organisations.';
  }

  labelStatut(s: string): string {
    return (
      ({
        EN_ATTENTE: 'En attente',
        APPROUVEE: 'Approuvée',
        REJETEE: 'Rejetée',
        SUSPENDUE: 'Suspendue',
      } as Record<string, string>)[s] ?? s
    );
  }

  async decider(item: OrganisationAdmin, statut: 'APPROUVEE' | 'REJETEE' | 'SUSPENDUE'): Promise<void> {
    let motif: string | undefined;
    if (statut === 'REJETEE' || statut === 'SUSPENDUE') {
      const saisi = await this.confirmation.askText(
        `Un motif est nécessaire pour ${statut === 'REJETEE' ? 'rejeter' : 'suspendre'} « ${item.nom} ».`,
        { title: statut === 'REJETEE' ? 'Motif du rejet' : 'Motif de suspension', inputLabel: 'Motif', inputPlaceholder: 'Expliquez brièvement la décision', inputRequired: true, inputMaxLength: 2000, confirmLabel: 'Continuer', danger: true },
      );
      motif = saisi?.trim();
      if (!motif) return;
    }
    if (this.pending.has(item.id)) return;
    const ok = await this.confirmation.confirm(
      `${statut === 'APPROUVEE' ? 'Approuver' : statut === 'REJETEE' ? 'Rejeter' : 'Suspendre'} l’organisation « ${item.nom} » ?${motif ? ` Motif : ${motif}` : ''}`,
      { title: 'Décision sur une organisation', confirmLabel: statut === 'APPROUVEE' ? 'Approuver' : statut === 'REJETEE' ? 'Rejeter' : 'Suspendre', danger: statut !== 'APPROUVEE' },
    );
    if (!ok) return;
    const old = item.statut;
    this.pending.add(item.id);
    this.actionError.set('');
    this.message.set('');
    this.service.modifierStatutOrganisation(item.id, statut, motif).subscribe({
      next: (updated) => {
        item.statut = updated.statut ?? statut;
        this.pending.delete(item.id);
        this.message.set(
          `Le statut est maintenant « ${this.labelStatut(item.statut)} » pour ${item.nom}.`
        );
        this.organisationsResource.reload();
      },
      error: (e: Error) => {
        item.statut = old;
        this.pending.delete(item.id);
        this.actionError.set(e.message || 'La décision n’a pas été enregistrée.');
      },
    });
  }
}
