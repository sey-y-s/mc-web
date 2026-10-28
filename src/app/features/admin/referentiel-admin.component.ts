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
            Vue Arborescente
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
          <button class="btn btn-primary" type="button" (click)="ouvrirModalAjout()">
            + Ajouter
          </button>
        </div>
      </div>

      @if (loading()) { 
        <p class="py-8 text-sm" role="status">Chargement du référentiel…</p> 
      } 
      
      <!-- ================= 1. VUE ARBORESCENTE ================= -->
      @else if (tab() === 'arborescence') {
        <div class="space-y-4">
          @let secteursFiltres = secteursArborescenceFiltres();
          @if (!secteursFiltres.length) {
            <p class="py-6 text-sm text-slate-500">Aucun résultat trouvé dans l'arborescence.</p>
          } @else {
            @for (s of secteursFiltres; track s.id) {
              <div class="border border-base-300 rounded-xl p-4 bg-base-100 shadow-sm">
                <!-- Ligne Secteur -->
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 cursor-pointer select-none flex-1" (click)="toggleSecteur(s.id)">
                    <span class="text-xs font-medium opacity-60">{{ secteurOuvert() === s.id ? '▼' : '▶' }}</span>
                    <div>
                      <h3 class="font-bold text-base text-primary">{{ s.nom }}</h3>
                      <p class="text-xs text-slate-500">{{ s.description || 'Aucune description' }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button class="btn btn-sm btn-secondary" (click)="ouvrirModalAjoutEnfant('metiers', s.id)">+ Métier</button>
                    <!-- Menu contextuel ⋯ -->
                    <div class="dropdown dropdown-end">
                      <div tabindex="0" role="button" class="btn btn-sm btn-secondary px-2">⋯</div>
                      <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300 text-sm">
                        <li><a (click)="editerEntite('secteurs', s)">Modifier</a></li>
                        <li><a class="text-error" (click)="supprimerEntite('secteurs', s.id, s.nom)">Supprimer</a></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <!-- Métiers du secteur -->
                @if (secteurOuvert() === s.id) {
                  <div class="mt-4 pl-4 border-l-2 border-primary/20 space-y-3">
                    @let metiersDuSecteur = getMetiersFiltresParSecteur(s.id);
                    @if (!metiersDuSecteur.length) {
                      <p class="text-xs text-slate-400 italic">Aucun métier dans ce secteur.</p>
                    } @else {
                      @for (m of metiersDuSecteur; track m.id) {
                        <div class="bg-base-200/60 p-3 rounded-lg flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2 cursor-pointer select-none flex-1" (click)="toggleMetier(m.id)">
                            <span class="text-xs font-medium opacity-60">{{ metierOuvert() === m.id ? '▼' : '▶' }}</span>
                            <div>
                              <span class="font-medium text-sm">{{ m.nom }}</span>
                              <p class="text-xs text-slate-500">{{ m.description || '—' }}</p>
                            </div>
                          </div>

                          <div class="flex items-center gap-2">
                            <button class="btn btn-sm btn-secondary" (click)="ouvrirModalAjoutEnfant('competences', m.id)">+ Compétence</button>
                            <!-- Menu contextuel ⋯ -->
                            <div class="dropdown dropdown-end">
                              <div tabindex="0" role="button" class="btn btn-sm btn-secondary px-2">⋯</div>
                              <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-36 border border-base-300 text-xs">
                                <li><a (click)="editerEntite('metiers', m)">Modifier</a></li>
                                <li><a class="text-error" (click)="supprimerEntite('metiers', m.id, m.nom)">Supprimer</a></li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <!-- Compétences du métier -->
                        @if (metierOuvert() === m.id) {
                          <div class="pl-4 ml-2 border-l border-base-300 space-y-2 py-2">
                            @let competencesDuMetier = getCompetencesFiltreesParMetier(m.id);
                            @if (!competencesDuMetier.length) {
                              <p class="text-xs text-slate-400 italic">Aucune compétence rattachée à ce métier.</p>
                            } @else {
                              <div class="grid gap-2 sm:grid-cols-2">
                                @for (c of competencesDuMetier; track c.id) {
                                  <div class="p-2 bg-base-100 border border-base-200 rounded text-xs flex justify-between items-center">
                                    <div>
                                      <span class="font-semibold">{{ c.nom }}</span>
                                      @if (c.parcoursPossibles?.length === 1) { <span class="badge badge-primary badge-xs ml-1 mc-badge-lisible">{{ libelleParcours(c) }}</span> }
                                      <p class="text-slate-400 truncate max-w-45">{{ c.description || '—' }}</p>
                                    </div>
                                    <!-- Menu contextuel ⋯ -->
                                    <div class="dropdown dropdown-end">
                                      <div tabindex="0" role="button" class="btn btn-xs btn-secondary px-1">⋯</div>
                                      <ul tabindex="0" class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-300 text-xs">
                                        <li><a (click)="editerEntite('competences', c)">Modifier</a></li>
                                        <li><a class="text-error" (click)="supprimerEntite('competences', c.id, c.nom)">Supprimer</a></li>
                                      </ul>
                                    </div>
                                  </div>
                                }
                              </div>
                            }
                          </div>
                        }
                      }
                    }
                  </div>
                }
              </div>
            }
          }
        </div>
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
  }

  toggleMetier(id: string) {
    this.metierOuvert.set(this.metierOuvert() === id ? null : id);
  }

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
        this.reloadAll();
      },
      error: (e) => {
        this.saving.set(false);
        this.actionError.set(e.error?.message ?? e.message ?? 'Suppression refusée.');
      },
    });
  }
}