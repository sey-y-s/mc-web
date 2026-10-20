import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AdminValidation } from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';

@Component({
  selector: 'app-validations-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Validations" description="Examiner les demandes et enregistrer les décisions de validation." />
    <section class="mc-card p-5 sm:p-6">
      @if (validationsResource.error() || actionError()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }
      <div class="mb-4 flex flex-wrap gap-3"><input class="mc-input max-w-sm" type="search" [ngModel]="query()" (ngModelChange)="query.set($event); page.set(1)" placeholder="Rechercher par libellé ou type" aria-label="Rechercher une validation" /><select class="mc-input max-w-xs" [ngModel]="filter()" (ngModelChange)="filter.set($event); page.set(1)" aria-label="Filtrer les validations"><option value="">Tous les statuts</option><option value="EN_ATTENTE">En attente</option><option value="APPROUVEE">Approuvée</option><option value="REJETEE">Rejetée</option></select></div>
      @if (validationsResource.isLoading()) { <p class="py-8 text-sm text-slate-500">Chargement des validations…</p> } @else if (!filtered().length) { <p class="py-8 text-sm text-slate-500">Aucune validation pour ces filtres.</p> } @else { <div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Type</th><th>Libellé</th><th>Statut</th><th>Décision</th></tr></thead><tbody>@for (v of pageItems(); track v.id) { <tr><td>{{ v.type }}</td><td>{{ v.libelle }}</td><td>{{ v.statut }}</td><td><div class="flex flex-wrap gap-2"><button class="btn btn-sm btn-secondary" [disabled]="pending.has(v.id) || v.statut==='APPROUVEE'" (click)="decider(v,'APPROUVEE')">Approuver</button><button class="btn btn-sm btn-secondary" [disabled]="pending.has(v.id) || v.statut==='REJETEE'" (click)="decider(v,'REJETEE')">Rejeter</button></div></td></tr> }</tbody></table></div><div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{{ filtered().length }} résultat(s) · Page {{ page() }} / {{ totalPages() }}</span><div class="flex gap-2"><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Précédent</button><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Suivant</button></div></div> }
    </section>
  `,
})
export class ValidationsAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);

  readonly query = signal('');
  readonly filter = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly message = signal('');
  readonly actionError = signal('');
  readonly pending = new Set<string>();

  readonly validationsResource = rxResource({
    stream: () => this.service.validations(),
    defaultValue: [] as AdminValidation[],
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const flt = this.filter();
    const list = this.validationsResource.value() ?? [];
    return list
      .filter(
        (v) =>
          (!flt || v.statut === flt) &&
          (!q || `${v.type} ${v.libelle}`.toLocaleLowerCase().includes(q))
      )
      .sort((a, b) => Number(b.statut === 'EN_ATTENTE') - Number(a.statut === 'EN_ATTENTE'));
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize))
  );

  readonly pageItems = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    return this.filtered().slice((p - 1) * this.pageSize, p * this.pageSize);
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.validationsResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les validations.';
  }

  async decider(v: AdminValidation, statut: AdminValidation['statut']): Promise<void> {
    let commentaire: string | undefined;
    if (statut === 'REJETEE') {
      const saisi = await this.confirmation.askText('Expliquez brièvement pourquoi cette validation est rejetée.', { title: 'Motif du rejet', inputLabel: 'Commentaire', inputPlaceholder: '500 caractères maximum', inputRequired: true, inputMaxLength: 500, confirmLabel: 'Continuer', danger: true });
      commentaire = saisi?.trim();
      if (!commentaire) {
        this.actionError.set('Le rejet nécessite un commentaire.');
        return;
      }
    }
    const ok = await this.confirmation.confirm(`${statut === 'APPROUVEE' ? 'Approuver' : 'Rejeter'} cette validation ?`, { title: 'Décision de validation', confirmLabel: statut === 'APPROUVEE' ? 'Approuver' : 'Rejeter', danger: statut !== 'APPROUVEE' });
    if (!ok) return;

    const old = v.statut;
    this.pending.add(v.id);
    this.actionError.set('');
    this.message.set('');

    this.service.modifierStatutValidation(v.id, statut, commentaire).subscribe({
      next: (saved) => {
        v.statut = saved.statut;
        this.pending.delete(v.id);
        this.message.set('La décision a été enregistrée.');
        this.validationsResource.reload();
      },
      error: (e: Error) => {
        v.statut = old;
        this.pending.delete(v.id);
        this.actionError.set(e.message || 'Impossible d’enregistrer la décision.');
      },
    });
  }
}
