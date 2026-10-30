import { Observable } from 'rxjs';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import {
  AdminService,
  ReferentielCompetence,
  ParcoursCompetence,
  ReferentielMetier,
  ReferentielSecteur,
} from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';

type Tab = 'arborescence' | 'secteurs' | 'metiers' | 'competences';
type EntityType = 'secteurs' | 'metiers' | 'competences';

@Component({
  selector: 'app-referentiel-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header 
      title="Référentiel" 
      description="Administrer et explorer la hiérarchie des secteurs, métiers et compétences." 
    />
    
    <section class="mc-card p-5 sm:p-6">
      @if (errorMessage()) { 
        <p class="mb-3 text-sm text-error" role="alert">{{ errorMessage() }}</p> 
      }
      @if (message()) { 
        <p class="mb-3 text-sm text-success" role="status">{{ message() }}</p> 
      }
      
      <!-- Barre d'onglets et actions principales -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-base-200 pb-4">
        <div class="flex flex-wrap gap-2" role="tablist">
          <button class="btn" type="button" role="tab" [attr.aria-selected]="tab() === 'arborescence'" [class.btn-primary]="tab() === 'arborescence'" [class.btn-secondary]="tab() !== 'arborescence'" (click)="changerTab('arborescence')">
            Hiérarchie
          </button>
          <button class="btn" type="button" role="tab" [attr.aria-selected]="tab() === 'secteurs'" [class.btn-primary]="tab() === 'secteurs'" [class.btn-secondary]="tab() !== 'secteurs'" (click)="changerTab('secteurs')">
            Secteurs ({{ secteurs().length }})
          </button>
          <button class="btn" type="button" role="tab" [attr.aria-selected]="tab() === 'metiers'" [class.btn-primary]="tab() === 'metiers'" [class.btn-secondary]="tab() !== 'metiers'" (click)="changerTab('metiers')">
            Métiers ({{ metiers().length }})
          </button>
          <button class="btn" type="button" role="tab" [attr.aria-selected]="tab() === 'competences'" [class.btn-primary]="tab() === 'competences'" [class.btn-secondary]="tab() !== 'competences'" (click)="changerTab('competences')">
            Compétences ({{ competences().length }})
          </button>
        </div>

        <div class="flex items-center gap-2">
          <input 
            class="mc-input input-sm max-w-xs" 
            type="search" 
            [ngModel]="rechercheGlobale()" 
            (ngModelChange)="rechercheGlobale.set($event)" 
            placeholder="Rechercher..." 
          />
          @if (tab() !== 'arborescence') {
            <button class="btn btn-primary" type="button" (click)="ouvrirModalAjout()">＋ Ajouter</button>
          }
        </div>
      </div>

      @if (loading()) { 
        <p class="py-8 text-sm" role="status">Chargement du référentiel…</p> 
      } 
      
      <!-- ================= 1. VUE ARBORESCENTE ================= -->
      @else if (tab() === 'arborescence') {
        @if (!secteurOuvert()) {
          <nav class="mb-5 flex items-center gap-2 text-sm" aria-label="Fil d’Ariane">
            <span class="font-semibold text-gray-900 dark:text-white">Référentiel</span>
            <span class="text-gray-400">/</span>
            <span class="text-gray-500 dark:text-gray-400">Secteurs</span>
          </nav>
          <div class="mb-4 flex items-center justify-between gap-3">
            <div><h2 class="text-lg font-semibold text-gray-900 dark:text-white">Secteurs d’activité</h2><p class="mc-muted">Choisissez un secteur pour parcourir ses métiers et compétences.</p></div>
            <button class="btn btn-primary btn-sm" type="button" (click)="ouvrirModalAjout()"><span aria-hidden="true">＋</span> Ajouter un secteur</button>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            @for (s of secteursArborescenceFiltres(); track s.id) {
              <article class="group flex min-h-44 flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-theme-md dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center justify-between"><span class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><svg viewBox="0 0 24 24" class="size-5" fill="none" aria-hidden="true"><path d="M4 5.5h6l2 2h8v11H4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M4 9h16" stroke="currentColor" stroke-width="1.5"/></svg></span><span class="text-xs text-gray-400">{{ getMetiersFiltresParSecteur(s.id).length }} métier(s)</span></div>
                <h3 class="mt-4 font-semibold text-gray-900 dark:text-white">{{ s.nom }}</h3><p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ s.description || 'Aucune description' }}</p>
                <div class="mt-auto pt-4"><button class="btn btn-secondary btn-sm w-full" type="button" (click)="toggleSecteur(s.id)">Détails <span aria-hidden="true">→</span></button></div>
              </article>
            } @empty { <p class="col-span-full py-8 text-center text-sm text-gray-500">Aucun secteur trouvé.</p> }
          </div>
        } @else if (!metierOuvert()) {
          @let secteur = secteurCourant();
          <nav class="mb-5 flex flex-wrap items-center gap-2 text-sm" aria-label="Fil d’Ariane">
            <button type="button" class="text-gray-500 hover:text-brand-700 hover:underline dark:text-gray-400" (click)="retourSecteurs()">Référentiel</button>
            <span class="text-gray-400">/</span><button type="button" class="text-gray-500 hover:text-brand-700 hover:underline dark:text-gray-400" (click)="retourSecteurs()">Secteurs</button>
            <span class="text-gray-400">/</span><span class="font-semibold text-gray-900 dark:text-white">{{ secteur?.nom }}</span>
          </nav>
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ secteur?.nom }}</h2><p class="mc-muted">Métiers rattachés à ce secteur.</p></div><div class="flex gap-2"><button class="btn btn-secondary btn-sm" type="button" (click)="editerEntite('secteurs', secteur)">Modifier</button><button class="btn btn-ghost btn-sm text-error-600" type="button" (click)="supprimerEntite('secteurs', secteur!.id, secteur!.nom)">Supprimer</button><button class="btn btn-primary btn-sm" type="button" (click)="ouvrirModalAjoutEnfant('metiers', secteurOuvert()!)">＋ Ajouter un métier</button></div></div>
          <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            @for (m of getMetiersFiltresParSecteur(secteurOuvert()!); track m.id) {
              <article class="flex min-h-40 flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"><div class="flex size-10 items-center justify-center rounded-xl bg-ocre-50 text-ocre-700"><svg viewBox="0 0 24 24" class="size-5" fill="none"><path d="M12 3.5 20 7v5c0 4.3-3.1 7.2-8 8.5C7.1 19.2 4 16.3 4 12V7l8-3.5Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 12h8m-4-4v8" stroke="currentColor" stroke-width="1.5"/></svg></div><h3 class="mt-3 font-semibold text-gray-900 dark:text-white">{{ m.nom }}</h3><p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ m.description || 'Aucune description' }}</p><div class="mt-auto pt-4"><button class="btn btn-secondary btn-sm w-full" type="button" (click)="toggleMetier(m.id)">Détails <span aria-hidden="true">→</span></button></div></article>
            } @empty { <p class="col-span-full py-8 text-center text-sm text-gray-500">Aucun métier dans ce secteur. Ajoutez le premier métier.</p> }
          </div>
        } @else {
          @let secteur = secteurCourant();
          @let metier = metierCourant();
          <nav class="mb-5 flex flex-wrap items-center gap-2 text-sm" aria-label="Fil d’Ariane">
            <button type="button" class="text-gray-500 hover:text-brand-700 hover:underline dark:text-gray-400" (click)="retourSecteurs()">Référentiel</button>
            <span class="text-gray-400">/</span><button type="button" class="text-gray-500 hover:text-brand-700 hover:underline dark:text-gray-400" (click)="retourSecteurs()">Secteurs</button>
            <span class="text-gray-400">/</span><button type="button" class="text-gray-500 hover:text-brand-700 hover:underline dark:text-gray-400" (click)="retourMetiers()">{{ secteur?.nom }}</button>
            <span class="text-gray-400">/</span><span class="font-semibold text-gray-900 dark:text-white">{{ metier?.nom }}</span>
          </nav>
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 class="text-lg font-semibold text-gray-900 dark:text-white">{{ metier?.nom }}</h2><p class="mc-muted">Compétences associées à ce métier.</p></div><div class="flex gap-2"><button class="btn btn-secondary btn-sm" type="button" (click)="editerEntite('metiers', metier)">Modifier</button><button class="btn btn-ghost btn-sm text-error-600" type="button" (click)="supprimerEntite('metiers', metier!.id, metier!.nom)">Supprimer</button><button class="btn btn-primary btn-sm" type="button" (click)="ouvrirModalAjoutEnfant('competences', metierOuvert()!)">＋ Ajouter une compétence</button></div></div>
          <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            @for (c of getCompetencesFiltreesParMetier(metierOuvert()!); track c.id) {
              <article class="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"><span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><svg viewBox="0 0 24 24" class="size-5" fill="none"><path d="M12 3.5 14.5 9l6 .8-4.4 4.3 1 6-5.1-2.7-5.1 2.7 1-6-4.4-4.3 6-.8L12 3.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg></span><div class="min-w-0 flex-1"><h3 class="font-semibold text-gray-900 dark:text-white">{{ c.nom }}</h3><p class="mt-1 text-xs text-gray-500">{{ libelleParcours(c) }}</p><div class="mt-3 flex items-center gap-3"><button class="text-sm font-medium text-brand-700 hover:underline" type="button" (click)="editerEntite('competences', c)">Modifier</button><button class="text-sm font-medium text-error-600 hover:underline" type="button" (click)="supprimerEntite('competences', c.id, c.nom)">Supprimer</button></div></div></article>
            } @empty { <p class="col-span-full py-8 text-center text-sm text-gray-500">Aucune compétence pour ce métier.</p> }
          </div>
        }
      }

      <!-- ================= 2. ONGLET SECTEURS ================= -->
      @else if (tab() === 'secteurs') {
        @let items = secteursFiltreesPage();
        @if (!items.length) {
          <p class="py-6 text-sm text-slate-500">Aucun secteur trouvé.</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead><tr><th>Secteur</th><th>Description</th><th class="text-right">Actions</th></tr></thead>
              <tbody>
                @for (s of items; track s.id) { 
                  <tr>
                    <td class="font-medium">{{ s.nom }}</td>
                    <td>{{ s.description || '—' }}</td>
                    <td class="text-right">
                      <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-sm btn-secondary px-2">⋯</div>
                        <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300 text-xs">
                          <li><a (click)="editerEntite('secteurs', s)">Modifier</a></li>
                          <li><a class="text-error" (click)="supprimerEntite('secteurs', s.id, s.nom)">Supprimer</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr> 
                }
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>{{ secteursFiltrees().length }} secteur(s) · Page {{ pageSecteurs() }} / {{ totalPagesSecteurs() }}</span>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-secondary" type="button" [disabled]="pageSecteurs() <= 1" (click)="pageSecteurs.set(pageSecteurs() - 1)">Précédent</button>
              <button class="btn btn-sm btn-secondary" type="button" [disabled]="pageSecteurs() >= totalPagesSecteurs()" (click)="pageSecteurs.set(pageSecteurs() + 1)">Suivant</button>
            </div>
          </div>
        }
      }

      <!-- ================= 3. ONGLET METIERS ================= -->
      @else if (tab() === 'metiers') {
        @let items = metiersFiltreesPage();
        @if (!items.length) {
          <p class="py-6 text-sm text-slate-500">Aucun métier trouvé.</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead><tr><th>Métier</th><th>Secteur</th><th>Description</th><th class="text-right">Actions</th></tr></thead>
              <tbody>
                @for (m of items; track m.id) { 
                  <tr>
                    <td class="font-medium">{{ m.nom }}</td>
                    <td>{{ m.secteurNom || '—' }}</td>
                    <td>{{ m.description || '—' }}</td>
                    <td class="text-right">
                      <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-sm btn-secondary px-2">⋯</div>
                        <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300 text-xs">
                          <li><a (click)="editerEntite('metiers', m)">Modifier</a></li>
                          <li><a class="text-error" (click)="supprimerEntite('metiers', m.id, m.nom)">Supprimer</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr> 
                }
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>{{ metiersFiltrees().length }} métier(s) · Page {{ pageMetiers() }} / {{ totalPagesMetiers() }}</span>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-secondary" type="button" [disabled]="pageMetiers() <= 1" (click)="pageMetiers.set(pageMetiers() - 1)">Précédent</button>
              <button class="btn btn-sm btn-secondary" type="button" [disabled]="pageMetiers() >= totalPagesMetiers()" (click)="pageMetiers.set(pageMetiers() + 1)">Suivant</button>
            </div>
          </div>
        }
      }

      <!-- ================= 4. ONGLET COMPETENCES ================= -->
      @else {
        @let items = competencesFiltreesPage();
        @if (!items.length) {
          <p class="py-6 text-sm text-slate-500">Aucune compétence trouvée.</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="table w-full">
              <thead><tr><th>Compétence</th><th>Métier</th><th>Secteur</th><th>Acquisition</th><th>Description</th><th class="text-right">Actions</th></tr></thead>
              <tbody>
                @for (c of items; track c.id) { 
                  <tr>
                    <td class="font-medium">{{ c.nom }}</td>
                    <td>{{ c.metierNom || '—' }}</td>
                    <td>{{ c.secteurNom || '—' }}</td>
                    <td><span class="badge badge-sm whitespace-nowrap mc-badge-lisible" [class.badge-primary]="c.parcoursPossibles?.length === 1">{{ libelleParcours(c) }}</span></td>
                    <td>{{ c.description || '—' }}</td>
                    <td class="text-right">
                      <div class="dropdown dropdown-end">
                        <div tabindex="0" role="button" class="btn btn-sm btn-secondary px-2">⋯</div>
                        <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300 text-xs">
                          <li><a (click)="editerEntite('competences', c)">Modifier</a></li>
                          <li><a class="text-error" (click)="supprimerEntite('competences', c.id, c.nom)">Supprimer</a></li>
                        </ul>
                      </div>
                    </td>
                  </tr> 
                }
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>{{ competencesFiltrees().length }} compétence(s) · Page {{ pageCompetences() }} / {{ totalPagesCompetences() }}</span>
            <div class="flex gap-2">
              <button class="btn btn-sm btn-secondary" type="button" [disabled]="pageCompetences() <= 1" (click)="pageCompetences.set(pageCompetences() - 1)">Précédent</button>
              <button class="btn btn-sm btn-secondary" type="button" [disabled]="pageCompetences() >= totalPagesCompetences()" (click)="pageCompetences.set(pageCompetences() + 1)">Suivant</button>
            </div>
          </div>
        }
      }
    </section>

    <!-- ================= MODAL DAISYUI / FORMULAIRE ================= -->
    @if (isModalOpen()) {
      <dialog class="modal modal-open">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">
            {{ editingId() ? 'Modifier l’élément' : 'Ajouter un nouvel élément' }}
          </h3>

          <form class="grid gap-3" (ngSubmit)="enregistrer()">
            @if (!editingId() && tab() === 'arborescence') {
              <label class="text-sm font-medium">Type d'élément
                <select class="mc-input mt-1" [(ngModel)]="modalType" name="modalType" required>
                  <option value="secteurs">Secteur</option>
                  <option value="metiers">Métier</option>
                  <option value="competences">Compétence</option>
                </select>
              </label>
            }

            <label class="text-sm font-medium">Nom
              <input class="mc-input mt-1" name="nom" [(ngModel)]="draft.nom" required maxlength="200" />
            </label>
            
            @if (modalType === 'metiers') { 
              <label class="text-sm font-medium">Secteur
                <select class="mc-input mt-1" name="secteurId" [(ngModel)]="draft.secteurId" required>
                  <option value="">Choisir un secteur</option>
                  @for (s of secteurs(); track s.id) { <option [value]="s.id">{{ s.nom }}</option> }
                </select>
              </label> 
            }
            
            @if (modalType === 'competences') { 
              <label class="text-sm font-medium">Métier
                <select class="mc-input mt-1" name="metierId" [(ngModel)]="draft.metierId" required>
                  <option value="">Choisir un métier</option>
                  @for (m of metiers(); track m.id) { <option [value]="m.id">{{ m.nom }} — {{ m.secteurNom }}</option> }
                </select>
              </label> 
              <fieldset class="rounded-lg border border-base-300 p-3">
                <legend class="px-1 text-sm font-medium">Secteurs possibles pour cette compétence</legend>
                <p class="mb-2 text-xs text-base-content/60">Ex. la science des données ne s’acquiert que par une formation : cochez seulement « Formel ».</p>
                <div class="flex flex-wrap gap-4">
                  <label class="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" class="checkbox checkbox-sm" name="parcoursFormel" [(ngModel)]="draft.formel" />
                    Formel (diplôme, certificat, attestation, stage)
                  </label>
                  <label class="flex cursor-pointer items-center gap-2 text-sm">
                    <input type="checkbox" class="checkbox checkbox-sm" name="parcoursInformel" [(ngModel)]="draft.informel" />
                    Informel (certificat de centre ou test)
                  </label>
                </div>
                @if (!draft.formel && !draft.informel) {
                  <p class="mt-2 text-xs text-error" role="alert">Cochez au moins un secteur.</p>
                }
              </fieldset>
            }
            
            <label class="text-sm font-medium">Description
              <textarea class="mc-input mt-1" name="description" [(ngModel)]="draft.description" rows="2"></textarea>
            </label>
            
            <div class="modal-action mt-6">
              <button class="btn btn-primary" type="submit" [disabled]="saving() || !draft.nom.trim() || (modalType === 'competences' && !draft.formel && !draft.informel)">
                {{ saving() ? 'Enregistrement…' : (editingId() ? 'Enregistrer' : 'Ajouter') }}
              </button>
              <button class="btn btn-secondary" type="button" (click)="fermerModal()">Annuler</button>
            </div>
          </form>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button type="button" (click)="fermerModal()">fermer</button>
        </form>
      </dialog>
    }
  `,
})
export class ReferentielAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly pageSize = 10;

  readonly tab = signal<Tab>('arborescence');
  readonly saving = signal(false);
  readonly message = signal('');
  readonly actionError = signal('');

  readonly isModalOpen = signal(false);
  readonly editingId = signal<string | null>(null);
  modalType: EntityType = 'secteurs';

  readonly secteurOuvert = signal<string | null>(null);
  readonly metierOuvert = signal<string | null>(null);

  readonly rechercheGlobale = signal('');
  readonly pageSecteurs = signal(1);
  readonly pageMetiers = signal(1);
  readonly pageCompetences = signal(1);

  draft = this.nouveauDraft();

  readonly secteursResource = rxResource({
    stream: () => this.service.secteurs(),
    defaultValue: [] as ReferentielSecteur[],
  });

  readonly metiersResource = rxResource({
    stream: () => this.service.metiers(),
    defaultValue: [] as ReferentielMetier[],
  });

  readonly competencesResource = rxResource({
    stream: () => this.service.referentielCompetences(),
    defaultValue: [] as ReferentielCompetence[],
  });

  readonly secteurs = computed(() => this.secteursResource.value() ?? []);
  readonly metiers = computed(() => this.metiersResource.value() ?? []);
  readonly competences = computed(() => this.competencesResource.value() ?? []);

  readonly loading = computed(
    () => this.secteursResource.isLoading() || this.metiersResource.isLoading() || this.competencesResource.isLoading()
  );

  /** Secteurs cochés dans le formulaire (au moins un). */
  parcoursDuDraft(): ParcoursCompetence[] {
    const l: ParcoursCompetence[] = [];
    if (this.draft.formel) l.push('FORMEL');
    if (this.draft.informel) l.push('INFORMEL');
    return l;
  }

  libelleParcours(c: ReferentielCompetence): string {
    const p = c.parcoursPossibles ?? [];
    if (p.length === 1) return p[0] === 'FORMEL' ? 'Formel uniquement' : 'Informel uniquement';
    return 'Formel et informel';
  }

  nouveauDraft() {
    return { nom: '', description: '', secteurId: '', metierId: '', formel: true, informel: true };
  }

  changerTab(t: Tab): void {
    this.tab.set(t);
    this.actionError.set('');
    this.message.set('');
  }

  toggleSecteur(id: string) {
    this.secteurOuvert.set(this.secteurOuvert() === id ? null : id);
    this.metierOuvert.set(null);
  }

  toggleMetier(id: string) {
    this.metierOuvert.set(this.metierOuvert() === id ? null : id);
  }

  retourSecteurs(): void { this.secteurOuvert.set(null); this.metierOuvert.set(null); }
  retourMetiers(): void { this.metierOuvert.set(null); }
  secteurCourant(): ReferentielSecteur | undefined { return this.secteurs().find((x) => x.id === this.secteurOuvert()); }
  metierCourant(): ReferentielMetier | undefined { return this.metiers().find((x) => x.id === this.metierOuvert()); }

  // Filtrages
  readonly secteursFiltrees = computed(() => {
    const q = this.rechercheGlobale().toLowerCase().trim();
    return !q ? this.secteurs() : this.secteurs().filter(s => s.nom.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q));
  });

  readonly metiersFiltrees = computed(() => {
    const q = this.rechercheGlobale().toLowerCase().trim();
    return !q ? this.metiers() : this.metiers().filter(m => m.nom.toLowerCase().includes(q) || m.secteurNom?.toLowerCase().includes(q));
  });

  readonly competencesFiltrees = computed(() => {
    const q = this.rechercheGlobale().toLowerCase().trim();
    return !q ? this.competences() : this.competences().filter(c => c.nom.toLowerCase().includes(q) || c.metierNom?.toLowerCase().includes(q) || c.secteurNom?.toLowerCase().includes(q));
  });

  readonly secteursArborescenceFiltres = computed(() => {
    const q = this.rechercheGlobale().toLowerCase().trim();
    if (!q) return this.secteurs();
    return this.secteurs().filter(s => {
      const matchSecteur = s.nom.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
      const metiersDuS = this.metiers().filter(m => m.secteurId === s.id);
      const matchMetier = metiersDuS.some(m => m.nom.toLowerCase().includes(q));
      const matchCompetence = this.competences().some(c => {
        const parentMetier = metiersDuS.find(m => m.id === c.metierId);
        return parentMetier && c.nom.toLowerCase().includes(q);
      });
      return matchSecteur || matchMetier || matchCompetence;
    });
  });

  getMetiersFiltresParSecteur(secteurId: string) {
    const q = this.rechercheGlobale().toLowerCase().trim();
    const list = this.metiers().filter(m => m.secteurId === secteurId);
    return !q ? list : list.filter(m => m.nom.toLowerCase().includes(q));
  }

  getCompetencesFiltreesParMetier(metierId: string) {
    const q = this.rechercheGlobale().toLowerCase().trim();
    const list = this.competences().filter(c => c.metierId === metierId);
    return !q ? list : list.filter(c => c.nom.toLowerCase().includes(q));
  }

  readonly totalPagesSecteurs = computed(() => Math.max(1, Math.ceil(this.secteursFiltrees().length / this.pageSize)));
  readonly totalPagesMetiers = computed(() => Math.max(1, Math.ceil(this.metiersFiltrees().length / this.pageSize)));
  readonly totalPagesCompetences = computed(() => Math.max(1, Math.ceil(this.competencesFiltrees().length / this.pageSize)));

  readonly secteursFiltreesPage = computed(() => this.secteursFiltrees().slice((this.pageSecteurs() - 1) * this.pageSize, this.pageSecteurs() * this.pageSize));
  readonly metiersFiltreesPage = computed(() => this.metiersFiltrees().slice((this.pageMetiers() - 1) * this.pageSize, this.pageMetiers() * this.pageSize));
  readonly competencesFiltreesPage = computed(() => this.competencesFiltrees().slice((this.pageCompetences() - 1) * this.pageSize, this.pageCompetences() * this.pageSize));

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = (this.secteursResource.error() || this.metiersResource.error() || this.competencesResource.error()) as any;
    return err?.error?.message ?? err?.message ?? '';
  }

  reloadAll(): void {
    this.secteursResource.reload();
    this.metiersResource.reload();
    this.competencesResource.reload();
  }

  ouvrirModalAjout(): void {
    this.editingId.set(null);
    this.draft = this.nouveauDraft();
    if (this.tab() === 'secteurs') this.modalType = 'secteurs';
    else if (this.tab() === 'metiers') this.modalType = 'metiers';
    else if (this.tab() === 'competences') this.modalType = 'competences';
    else this.modalType = 'secteurs';
    this.isModalOpen.set(true);
  }

  ouvrirModalAjoutEnfant(type: EntityType, parentId: string): void {
    this.editingId.set(null);
    this.modalType = type;
    this.draft = this.nouveauDraft();
    if (type === 'metiers') this.draft.secteurId = parentId;
    if (type === 'competences') this.draft.metierId = parentId;
    this.isModalOpen.set(true);
  }

  editerEntite(type: EntityType, item: any): void {
    this.editingId.set(item.id);
    this.modalType = type;
    this.draft = {
      nom: item.nom ?? '',
      description: item.description ?? '',
      secteurId: item.secteurId ?? '',
      metierId: item.metierId ?? '',
      formel: !item.parcoursPossibles?.length || item.parcoursPossibles.includes('FORMEL'),
      informel: !item.parcoursPossibles?.length || item.parcoursPossibles.includes('INFORMEL'),
    };
    this.isModalOpen.set(true);
  }

  fermerModal(): void {
    this.isModalOpen.set(false);
    this.editingId.set(null);
    this.draft = this.nouveauDraft();
  }

  enregistrer(): void {
    if (!this.draft.nom.trim() || this.saving()) return;
    this.saving.set(true);
    this.actionError.set('');
    this.message.set('');

    const desc = this.draft.description.trim() || undefined;
    const currentId = this.editingId();
    const type = this.modalType;

    const obs: Observable<unknown> =
      type === 'secteurs'
        ? currentId ? this.service.modifierSecteur(currentId, { nom: this.draft.nom.trim(), description: desc })
                    : this.service.creerSecteur({ nom: this.draft.nom.trim(), description: desc })
        : type === 'metiers'
        ? currentId ? this.service.modifierMetier(currentId, { nom: this.draft.nom.trim(), description: desc, secteurId: this.draft.secteurId })
                    : this.service.creerMetier({ nom: this.draft.nom.trim(), description: desc, secteurId: this.draft.secteurId })
        : currentId ? this.service.modifierReferentielCompetence(currentId, { nom: this.draft.nom.trim(), description: desc, metierId: this.draft.metierId, parcoursPossibles: this.parcoursDuDraft() })
                    : this.service.creerReferentielCompetence({ nom: this.draft.nom.trim(), description: desc, metierId: this.draft.metierId, parcoursPossibles: this.parcoursDuDraft() });

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Enregistrement réussi.');
        this.fermerModal();
        this.reloadAll();
      },
      error: (e) => {
        this.saving.set(false);
        this.actionError.set(e.error?.message ?? e.message ?? 'Échec de l’enregistrement.');
      },
    });
  }

  async supprimerEntite(type: EntityType, id: string, nom: string): Promise<void> {
    const ok = await this.confirmation.confirm(`Supprimer « ${nom} » du référentiel ? Cette action peut empêcher de l’utiliser dans de nouveaux profils et besoins.`, { title: 'Supprimer du référentiel', confirmLabel: 'Supprimer', danger: true });
    if (!ok) return;
    this.saving.set(true);
    const obs = type === 'secteurs' ? this.service.supprimerSecteur(id)
              : type === 'metiers' ? this.service.supprimerMetier(id)
              : this.service.supprimerReferentielCompetence(id);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('Élément supprimé.');
        if (type === 'secteurs' && this.secteurOuvert() === id) this.retourSecteurs();
        if (type === 'metiers' && this.metierOuvert() === id) this.retourMetiers();
        this.reloadAll();
      },
      error: (e) => {
        this.saving.set(false);
        this.actionError.set(e.error?.message ?? e.message ?? 'Suppression refusée.');
      },
    });
  }
}