import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AdminUser, CentreAdmin } from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';
import { AuthService } from '../../core/auth/auth.service';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-centres-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Centres" description="Gérer les informations des centres de formation." />
    <section class="mc-card p-5 sm:p-6">
      @if (centresResource.error() || actionError()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }
      <form class="grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2" (ngSubmit)="enregistrer()">
        <label class="text-sm font-medium">Nom *<input class="mc-input mt-1" name="nom" [(ngModel)]="form.nom" maxlength="150" required /></label>
        <label class="text-sm font-medium">Téléphone<input class="mc-input mt-1" name="telephone" [(ngModel)]="form.telephone" maxlength="30" /></label>
        <label class="text-sm font-medium md:col-span-2">Adresse<input class="mc-input mt-1" name="adresse" [(ngModel)]="form.adresse" maxlength="255" /></label>
        <label class="text-sm font-medium md:col-span-2">Description<textarea class="mc-input mt-1" name="description" [(ngModel)]="form.description" rows="2"></textarea></label>
        <div class="flex flex-wrap gap-2 md:col-span-2"><button class="btn btn-primary" type="submit" [disabled]="saving()">{{ editId() ? 'Enregistrer les modifications' : 'Créer le centre' }}</button><button class="btn btn-secondary" type="button" (click)="resetForm()">{{ editId() ? 'Annuler' : 'Effacer' }}</button></div>
      </form>
      <div class="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]"><input class="mc-input" type="search" placeholder="Rechercher un centre" aria-label="Rechercher un centre" [ngModel]="recherche()" (ngModelChange)="recherche.set($event); page.set(1)" /><select class="mc-input" aria-label="Nombre de résultats par page" [ngModel]="pageSize()" (ngModelChange)="pageSize.set($event); page.set(1)"><option [ngValue]="10">10 par page</option><option [ngValue]="25">25 par page</option><option [ngValue]="50">50 par page</option></select></div>
      @if (centresResource.isLoading()) { <p class="py-8 text-sm text-slate-500" role="status">Chargement des centres…</p> }
      @else if (!centresFiltres().length) { <p class="py-8 text-sm text-slate-500">Aucun centre ne correspond à votre recherche.</p> }
      @else { <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Centre</th><th>Adresse</th><th>Téléphone</th><th>Gestionnaire</th><th>Actions</th></tr></thead><tbody>@for (c of centresPage(); track c.id) { <tr><td><div class="font-semibold">{{ c.nom }}</div><p class="text-xs text-base-content/60">{{ c.description || '' }}</p></td><td>{{ c.adresse || '—' }}</td><td>{{ c.telephone || '—' }}</td><td class="min-w-64"><div class="mb-1 text-xs text-base-content/60">{{ c.administrateurEmail || 'Aucun gestionnaire' }}</div>@if (isSuperAdmin()) { <select class="mc-input" [ngModel]="c.administrateurId || ''" (ngModelChange)="changerGestionnaire(c, $event)" [disabled]="saving()" [attr.aria-label]="'Gestionnaire de ' + c.nom"><option value="">Sans gestionnaire</option>@for (u of utilisateursAffectables(c); track u.id) { <option [value]="u.id">{{ u.email || u.telephone }}</option> }</select> } @else { <span class="text-sm">{{ c.administrateurEmail || 'Aucun gestionnaire' }}</span> }</td><td><div class="flex gap-2"><button class="btn btn-sm btn-secondary" type="button" (click)="editer(c)">Modifier</button><button class="btn btn-sm btn-secondary" type="button" (click)="supprimer(c)" [disabled]="saving()">Supprimer</button></div></td></tr> }</tbody></table></div><div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{{ centresFiltres().length }} centre(s) · Page {{ page() }} / {{ totalPages() }}</span><div class="flex gap-2"><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Précédent</button><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Suivant</button></div></div> }
    </section>
  `,
})
export class CentresAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly auth = inject(AuthService);

  isSuperAdmin(): boolean { return this.auth.getCurrentUser()?.role === 'SUPER_ADMIN'; }

  readonly recherche = signal('');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly actionError = signal('');
  readonly editId = signal<string | null>(null);

  form: Omit<CentreAdmin, 'id'> = { nom: '', description: '', adresse: '', telephone: '' };

  readonly utilisateursResource = rxResource({ stream: () => this.service.users(), defaultValue: [] as AdminUser[] });

  utilisateursAffectables(c: CentreAdmin) { return (this.utilisateursResource.value() ?? []).filter(u => u.actif && (u.role === 'CITOYEN' || u.id === c.administrateurId)); }

  readonly centresResource = rxResource({
    stream: () => this.service.centres(),
    defaultValue: [] as CentreAdmin[],
  });

  readonly centresFiltres = computed(() => {
    const q = this.recherche().trim().toLocaleLowerCase();
    const list = this.centresResource.value() ?? [];
    return list.filter(
      (c) => !q || `${c.nom} ${c.adresse ?? ''} ${c.telephone ?? ''}`.toLocaleLowerCase().includes(q)
    );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.centresFiltres().length / this.pageSize())));

  readonly centresPage = computed(() => {
    const current = Math.min(this.page(), this.totalPages());
    const size = this.pageSize();
    return this.centresFiltres().slice((current - 1) * size, current * size);
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.centresResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les centres.';
  }

  editer(c: CentreAdmin): void {
    this.editId.set(c.id);
    this.form = {
      nom: c.nom,
      description: c.description ?? '',
      adresse: c.adresse ?? '',
      telephone: c.telephone ?? '',
    };
    this.message.set('');
  }

  resetForm(): void {
    this.editId.set(null);
    this.form = { nom: '', description: '', adresse: '', telephone: '' };
  }

  enregistrer(): void {
    this.form.nom = this.form.nom.trim();
    if (!this.form.nom) {
      this.actionError.set('Le nom du centre est obligatoire.');
      return;
    }
    this.saving.set(true);
    this.actionError.set('');
    this.message.set('');

    const currentEditId = this.editId();
    const req = currentEditId
      ? this.service.modifierCentre(currentEditId, this.form)
      : this.service.creerCentre(this.form);

    req.subscribe({
      next: () => {
        this.message.set(currentEditId ? 'Centre modifié.' : 'Centre créé.');
        this.resetForm();
        this.saving.set(false);
        this.centresResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible d’enregistrer le centre.');
        this.saving.set(false);
      },
    });
  }

  async changerGestionnaire(c: CentreAdmin, utilisateurId: string): Promise<void> {
    if ((c.administrateurId ?? '') === utilisateurId) return;

    const ancien = c.administrateurEmail ? `Le gestionnaire actuel (${c.administrateurEmail}) sera remplacé. ` : '';
    const message = utilisateurId
      ? `${ancien}Affecter ce compte au centre « ${c.nom} » ? Il ne pourra gérer qu’un seul centre.`
      : `Retirer le gestionnaire du centre « ${c.nom} » ? Son rôle redeviendra Citoyen.`;

    const ok = await this.confirmation.confirm(message, {
      title: 'Gestionnaire du centre',
      confirmLabel: utilisateurId ? 'Affecter' : 'Retirer',
      danger: !utilisateurId,
    });

    if (!ok || this.saving()) {
      this.centresResource.reload();
      return;
    }

    this.saving.set(true);
    this.actionError.set('');
    this.message.set('');

    try {
      // Pas de ternaire complexe, pas de "as any" : TypeScript infère parfaitement les types ici
      if (utilisateurId) {
        await firstValueFrom(this.service.affecterGestionnaireCentre(c.id, utilisateurId));
        this.message.set('Gestionnaire affecté.');
      } else {
        await firstValueFrom(this.service.retirerGestionnaireCentre(c.id));
        this.message.set('Gestionnaire retiré.');
      }
    } catch (e: any) {
      this.actionError.set(e.message || 'Impossible de modifier le gestionnaire.');
    } finally {
      // Le bloc "finally" s'exécute TOUJOURS (succès ou erreur)
      // Fini la duplication de code pour réinitialiser le loader et recharger les ressources !
      this.saving.set(false);
      this.centresResource.reload();
      this.utilisateursResource.reload();
    }
  }

  async supprimer(c: CentreAdmin): Promise<void> {
    const ok = await this.confirmation.confirm(`Supprimer le centre « ${c.nom} » ? Cette action est irréversible.`, { title: 'Supprimer le centre', confirmLabel: 'Supprimer', danger: true });
    if (!ok) return;
    this.saving.set(true);
    this.actionError.set('');
    this.service.supprimerCentre(c.id).subscribe({
      next: () => {
        this.message.set('Centre supprimé.');
        this.saving.set(false);
        this.centresResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(
          e.message || 'Suppression refusée par le serveur. Le centre peut être utilisé.'
        );
        this.saving.set(false);
      },
    });
  }
}
