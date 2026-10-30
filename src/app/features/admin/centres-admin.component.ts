import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, AdminUser, CentreAdmin, CommuneAdmin, ReferentielCompetence, StatutCentre } from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';
import { AuthService } from '../../core/auth/auth.service';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-centres-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Centres" description="Informations, gestionnaire et agrément des centres d’évaluation." />
    <section class="mc-card p-5 sm:p-6">
      @if (centresResource.error() || actionError()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-gray-500">Consultez les centres et gérez leurs agréments.</p><button class="btn btn-primary" type="button" (click)="ouvrirCreation()"><span aria-hidden="true">＋</span> Ajouter un centre</button></div>
      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]"><input class="mc-input" type="search" placeholder="Rechercher un centre" aria-label="Rechercher un centre" [ngModel]="recherche()" (ngModelChange)="recherche.set($event); page.set(1)" /><select class="mc-input" aria-label="Nombre de résultats par page" [ngModel]="pageSize()" (ngModelChange)="pageSize.set($event); page.set(1)"><option [ngValue]="10">10 par page</option><option [ngValue]="25">25 par page</option><option [ngValue]="50">50 par page</option></select></div>
      @if (centresResource.isLoading()) { <p class="py-8 text-sm text-slate-500" role="status">Chargement des centres…</p> }
      @else if (!centresFiltres().length) { <p class="py-8 text-sm text-slate-500">Aucun centre ne correspond à votre recherche.</p> }
      @else { <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Centre</th><th>Agrément</th><th>Téléphone</th><th>Gestionnaire</th><th>Actions</th></tr></thead><tbody>@for (c of centresPage(); track c.id) { <tr><td><div class="font-semibold">{{ c.nom }}</div><p class="text-xs text-base-content/60">{{ c.description || '' }}</p></td><td><span class="badge badge-sm mc-badge-lisible" [class.badge-success]="c.statut === 'ACTIF'" [class.badge-warning]="c.statut === 'EN_ATTENTE'" [class.badge-error]="c.statut === 'SUSPENDU'">{{ libelleStatut(c.statut) }}</span><p class="mt-1 text-xs text-base-content/60">{{ c.nombreCompetencesAgreees ?? 0 }} compétence(s) agréée(s)</p></td><td>{{ c.telephone || '—' }}</td><td class="min-w-64">@if (isSuperAdmin()) { <div class="mb-1 text-xs text-base-content/60">{{ c.administrateurEmail || 'Aucun gestionnaire' }}</div> <select class="mc-input" [ngModel]="c.administrateurId || ''" (ngModelChange)="changerGestionnaire(c, $event)" [disabled]="saving()" [attr.aria-label]="'Gestionnaire de ' + c.nom"><option value="">Sans gestionnaire</option>@for (u of utilisateursAffectables(c); track u.id) { <option [value]="u.id">{{ u.email || u.telephone }}</option> }</select> } @else { <span class="text-sm">{{ c.administrateurEmail || 'Aucun gestionnaire' }}</span> }</td><td><div class="flex gap-2"><button class="btn btn-sm btn-primary" type="button" (click)="ouvrirAgrement(c)">Agrément</button><button class="btn btn-sm btn-secondary" type="button" (click)="editer(c)">Modifier</button><button class="btn btn-sm btn-secondary" type="button" (click)="supprimer(c)" [disabled]="saving()">Supprimer</button></div></td></tr> }</tbody></table></div><div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{{ centresFiltres().length }} centre(s) · Page {{ page() }} / {{ totalPages() }}</span><div class="flex gap-2"><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Précédent</button><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Suivant</button></div></div> }
      @if (formOpen()) {
        <dialog class="modal modal-open">
          <form class="modal-box max-w-xl" (ngSubmit)="enregistrer()">
            <div class="mb-5 flex items-center justify-between gap-3"><h2 class="text-lg font-semibold">{{ editId() ? 'Modifier le centre' : 'Ajouter un centre' }}</h2><button class="btn btn-ghost btn-sm" type="button" (click)="resetForm()" aria-label="Fermer">✕</button></div>
            <div class="grid gap-3 md:grid-cols-2">
              <label class="text-sm font-medium">Nom *<input class="mc-input mt-1" name="nom" [(ngModel)]="form.nom" maxlength="150" required /></label>
              <label class="text-sm font-medium">Téléphone<input class="mc-input mt-1" name="telephone" [(ngModel)]="form.telephone" maxlength="30" /></label>
              <label class="text-sm font-medium md:col-span-2">Adresse<input class="mc-input mt-1" name="adresse" [(ngModel)]="form.adresse" maxlength="255" /></label>
              <label class="text-sm font-medium md:col-span-2">Description<textarea class="mc-input mt-1" name="description" [(ngModel)]="form.description" rows="3"></textarea></label>
            </div>
            <div class="modal-action"><button class="btn btn-secondary" type="button" (click)="resetForm()">Annuler</button><button class="btn btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : (editId() ? 'Enregistrer' : 'Créer le centre') }}</button></div>
          </form>
        </dialog>
      }
    </section>
    @if (agrementCentre(); as ac) {
      <section class="mc-card mt-5 p-5 sm:p-6 mc-etape" aria-labelledby="titre-agrement">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="titre-agrement" class="mc-section-heading">Agrément — {{ ac.nom }}</h2>
            <p class="mt-1 text-sm text-base-content/65">Un centre n’évalue que s’il est actif, et seulement les compétences cochées. Ses évaluateurs ne peuvent pas aller au-delà.</p>
          </div>
          <button class="btn btn-ghost btn-sm" type="button" (click)="fermerAgrement()">Fermer</button>
        </div>
        <div class="mt-4 flex flex-wrap items-end gap-3 rounded-lg bg-slate-50 p-3">
          <label class="text-sm font-medium">Commune du centre
            <select class="mc-input mt-1 min-w-64" [ngModel]="communeCentre()" (ngModelChange)="communeCentre.set($event)" aria-label="Commune du centre">
              <option value="">Non renseignée</option>
              @for (m of communes(); track m.id) { <option [value]="m.id">{{ m.nom }}{{ m.regionNom ? ' — ' + m.regionNom : '' }}</option> }
            </select>
          </label>
          <button class="btn btn-secondary btn-sm" type="button" (click)="enregistrerCommune()" [disabled]="communeEnregistrement()">Enregistrer la commune</button>
          <p class="basis-full text-xs text-slate-500">Elle permet de proposer aux citoyens les centres situés dans leur commune ou leur région.</p>
        </div>
        <div class="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <fieldset>
            <legend class="mc-label">Statut du centre</legend>
            @for (s of statuts; track s) {
              <label class="mt-2 flex cursor-pointer items-center gap-2 text-sm">
                <input type="radio" class="radio radio-sm" name="statutCentre" [value]="s" [ngModel]="agrementStatut()" (ngModelChange)="agrementStatut.set($event)" />
                {{ libelleStatut(s) }}
              </label>
            }
          </fieldset>
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <input class="mc-input max-w-xs" type="search" placeholder="Filtrer les compétences" aria-label="Filtrer les compétences" [ngModel]="agrementFiltre()" (ngModelChange)="agrementFiltre.set($event)" />
              <button class="btn btn-ghost btn-xs" type="button" (click)="toutCocher(true)">Tout cocher</button>
              <button class="btn btn-ghost btn-xs" type="button" (click)="toutCocher(false)">Tout décocher</button>
              <span class="text-xs text-base-content/60">{{ agrementSelection().size }} cochée(s)</span>
            </div>
            @if (agrementChargement()) { <p class="mt-3 text-sm" role="status">Chargement de l’agrément…</p> }
            @else {
              <div class="mt-3 grid max-h-80 gap-1 overflow-y-auto rounded-lg border border-base-300 p-3 sm:grid-cols-2">
                @for (c of competencesFiltrees(); track c.id) {
                  <label class="flex cursor-pointer items-start gap-2 rounded px-1 py-1 text-sm hover:bg-base-200">
                    <input type="checkbox" class="checkbox checkbox-sm mt-0.5" [checked]="agrementSelection().has(c.id)" (change)="basculer(c.id)" />
                    <span>{{ c.nom }}<span class="block text-xs text-base-content/55">{{ c.metierNom }}</span></span>
                  </label>
                }
              </div>
            }
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <button class="btn btn-primary" type="button" (click)="enregistrerAgrement()" [disabled]="saving() || agrementChargement()">{{ saving() ? 'Enregistrement…' : 'Enregistrer l’agrément' }}</button>
          <button class="btn btn-secondary" type="button" (click)="fermerAgrement()">Annuler</button>
        </div>
      </section>
    }
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
  readonly formOpen = signal(false);

  form: Omit<CentreAdmin, 'id'> = { nom: '', description: '', adresse: '', telephone: '' };

  readonly statuts: StatutCentre[] = ['ACTIF', 'EN_ATTENTE', 'SUSPENDU'];
  readonly agrementCentre = signal<CentreAdmin | null>(null);
  readonly agrementStatut = signal<StatutCentre>('ACTIF');
  readonly agrementSelection = signal<Set<string>>(new Set());
  readonly agrementFiltre = signal('');
  readonly agrementChargement = signal(false);
  readonly communeCentre = signal('');
  readonly communeEnregistrement = signal(false);
  readonly communesResource = rxResource({ stream: () => this.service.communes(), defaultValue: [] as CommuneAdmin[] });
  readonly communes = computed(() => this.communesResource.value() ?? []);

  readonly competencesResource = rxResource({ stream: () => this.service.referentielCompetences(), defaultValue: [] as ReferentielCompetence[] });
  readonly competencesFiltrees = computed(() => {
    const q = this.agrementFiltre().trim().toLocaleLowerCase();
    return (this.competencesResource.value() ?? []).filter(
      (c) => !q || `${c.nom} ${c.metierNom ?? ''} ${c.secteurNom ?? ''}`.toLocaleLowerCase().includes(q),
    );
  });

  libelleStatut(s?: StatutCentre): string {
    return s === 'SUSPENDU' ? 'Suspendu' : s === 'EN_ATTENTE' ? 'En attente' : 'Actif';
  }

  ouvrirAgrement(c: CentreAdmin): void {
    this.agrementCentre.set(c);
    this.agrementFiltre.set('');
    this.agrementChargement.set(true);
    this.communeCentre.set('');
    this.service.communeCentre(c.id).subscribe({
      next: (r) => this.communeCentre.set(r.communeId ?? ''),
      error: () => this.communeCentre.set(''),
    });
    this.service.agrementCentre(c.id).subscribe({
      next: (a) => {
        this.agrementStatut.set(a.statut);
        this.agrementSelection.set(new Set(a.competences.map((x) => x.id)));
        this.agrementChargement.set(false);
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Agrément indisponible.');
        this.agrementChargement.set(false);
      },
    });
  }

  fermerAgrement(): void { this.agrementCentre.set(null); }

  enregistrerCommune(): void {
    const c = this.agrementCentre();
    if (!c) return;
    this.communeEnregistrement.set(true);
    this.actionError.set('');
    this.service.definirCommuneCentre(c.id, this.communeCentre() || null).subscribe({
      next: () => {
        this.message.set(`Commune enregistrée pour ${c.nom}.`);
        this.communeEnregistrement.set(false);
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible d’enregistrer la commune.');
        this.communeEnregistrement.set(false);
      },
    });
  }

  basculer(id: string): void {
    const s = new Set(this.agrementSelection());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.agrementSelection.set(s);
  }

  toutCocher(oui: boolean): void {
    const s = new Set(this.agrementSelection());
    for (const c of this.competencesFiltrees()) { if (oui) s.add(c.id); else s.delete(c.id); }
    this.agrementSelection.set(s);
  }

  enregistrerAgrement(): void {
    const c = this.agrementCentre();
    if (!c) return;
    this.saving.set(true);
    this.actionError.set('');
    this.service.modifierAgrementCentre(c.id, { statut: this.agrementStatut(), competenceIds: [...this.agrementSelection()] }).subscribe({
      next: (a) => {
        this.message.set(`Agrément enregistré : ${a.competences.length} compétence(s), centre ${this.libelleStatut(a.statut).toLowerCase()}.`);
        this.saving.set(false);
        this.agrementCentre.set(null);
        this.centresResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible d’enregistrer l’agrément.');
        this.saving.set(false);
      },
    });
  }

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

  ouvrirCreation(): void {
    this.resetForm();
    this.formOpen.set(true);
  }

  editer(c: CentreAdmin): void {
    this.editId.set(c.id);
    this.formOpen.set(true);
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
    this.formOpen.set(false);
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
      : `Retirer le gestionnaire du centre « ${c.nom} » ? Il perdra immédiatement l’accès à l’espace du centre.`;

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
