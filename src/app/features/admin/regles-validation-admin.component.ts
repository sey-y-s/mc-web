import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, ModaliteValidation, RegleValidation, RegleValidationRequest } from '../../core/services/admin.service';
import { Competence } from '../../shared/models';

interface RegleDraft {
  modalite: ModaliteValidation;
  libelle: string;
  actif: boolean;
  seuilReussite: number | null;
  pieces: Record<string, boolean>;
  profilsHabilites: string;
  criteres: string;
}

const PIECES = [
  { code: 'DIPLOME', label: 'Diplôme' },
  { code: 'CERTIFICAT', label: 'Certificat' },
  { code: 'ATTESTATION', label: 'Attestation' },
  { code: 'ATTESTATION_STAGE', label: 'Attestation de stage' },
  { code: 'CERTIFICAT_CENTRE', label: 'Certificat de centre' },
  { code: 'ATTESTATION_EMPLOYEUR', label: 'Attestation d’employeur' },
  { code: 'AUTRE', label: 'Autre pièce' },
];

@Component({
  selector: 'app-regles-validation-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Règles de validation" description="Pour chaque compétence, choisissez les modalités de validation autorisées, leur ordre de préférence, le seuil de réussite et les pièces admissibles. Le citoyen se voit proposer le parcours le plus adapté à sa situation." />
    <section class="mc-card p-5 sm:p-6">
      @if (error()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ error() }}</p> }
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }

      <div class="relative mb-4 max-w-xl">
        <label for="recherche-competence" class="block text-sm font-medium">Rechercher une compétence</label>
        <div class="relative mt-1">
          <svg class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="1.6"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          <input id="recherche-competence" class="mc-input pl-10" type="search" autocomplete="off" [ngModel]="rechercheCompetence()" (ngModelChange)="rechercher($event)" placeholder="Saisir le nom d’une compétence…" />
        </div>
        @if (rechercheCompetence().trim() && !competenceId()) {
          <div class="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900" role="listbox" aria-label="Résultats de recherche">
            @for (c of competencesFiltrees(); track c.id) {
              <button type="button" class="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800" (click)="choisir(c.id)">
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ c.nom }}</span>
                <span class="text-xs text-gray-500">{{ c.metierNom || 'Métier non précisé' }} · {{ c.secteurNom || 'Secteur non précisé' }}</span>
              </button>
            } @empty { <p class="px-3 py-3 text-sm text-gray-500">Aucune compétence ne correspond à cette recherche.</p> }
          </div>
        }
        @if (competenceSelectionnee(); as selected) {
          <div class="mt-2 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200">
            <span><strong>{{ selected.nom }}</strong><span class="ml-2 text-xs opacity-75">{{ selected.metierNom || '' }}</span></span>
            <button type="button" class="text-xs font-semibold hover:underline" (click)="effacerSelection()">Changer</button>
          </div>
        }
      </div>

      @if (loading()) { <p class="py-6 text-sm text-slate-500">Chargement des règles…</p> }
      @else if (competenceId() && regles().length) {
        @if (parDefaut()) {
          <p class="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Aucune règle personnalisée pour cette compétence : les règles par défaut s’appliquent (selon son parcours formel ou informel). Modifiez puis enregistrez pour les personnaliser.</p>
        }
        <div class="mt-5 space-y-4">
          @for (r of regles(); track r.modalite; let i = $index) {
            <article class="rounded-xl border border-slate-200 p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <label class="flex items-center gap-2 font-semibold"><input type="checkbox" [name]="'actif' + i" [(ngModel)]="r.actif" /> {{ r.libelle }}</label>
                <div class="flex gap-2">
                  <button class="btn btn-ghost btn-sm" type="button" (click)="monter(i)" [disabled]="i === 0" aria-label="Monter">↑</button>
                  <button class="btn btn-ghost btn-sm" type="button" (click)="descendre(i)" [disabled]="i === regles().length - 1" aria-label="Descendre">↓</button>
                </div>
              </div>
              @if (r.actif) {
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                  @if (r.modalite === 'TEST_NUMERIQUE') {
                    <label class="text-sm font-medium">Seuil de réussite (%)
                      <input class="mc-input mt-1" type="number" min="0" max="100" [name]="'seuil' + i" [(ngModel)]="r.seuilReussite" placeholder="60 par défaut" />
                    </label>
                  }
                  <label class="text-sm font-medium">Profils habilités à valider
                    <input class="mc-input mt-1" [name]="'profils' + i" [(ngModel)]="r.profilsHabilites" maxlength="300" placeholder="Ex. évaluateur de centre, jury, maître artisan" />
                  </label>
                  <label class="text-sm font-medium md:col-span-2">Critères d’évaluation
                    <textarea class="mc-input mt-1" rows="2" [name]="'criteres' + i" [(ngModel)]="r.criteres" maxlength="500"></textarea>
                  </label>
                  @if (r.modalite === 'DOCUMENTAIRE') {
                    <fieldset class="md:col-span-2">
                      <legend class="text-sm font-medium">Pièces justificatives admissibles</legend>
                      <p class="text-xs text-slate-500">Si rien n’est coché, les pièces prévues par le parcours (formel ou informel) s’appliquent.</p>
                      <div class="mt-2 flex flex-wrap gap-x-5 gap-y-2">
                        @for (p of pieces; track p.code) {
                          <label class="flex items-center gap-2 text-sm"><input type="checkbox" [name]="'piece' + i + p.code" [(ngModel)]="r.pieces[p.code]" /> {{ p.label }}</label>
                        }
                      </div>
                    </fieldset>
                  }
                </div>
              }
            </article>
          }
        </div>
        <p class="mt-3 text-xs text-slate-500">L’ordre indique la préférence de proposition, pas une hiérarchie : si la première modalité n’est pas réalisable près du citoyen, la suivante est proposée automatiquement.</p>
        <div class="mt-5 flex flex-wrap gap-2">
          <button class="btn btn-primary" type="button" (click)="enregistrer()" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : 'Enregistrer les règles' }}</button>
          <button class="btn btn-secondary" type="button" (click)="reinitialiser()" [disabled]="saving() || parDefaut()">Revenir aux règles par défaut</button>
        </div>
      }
    </section>
  `,
})
export class ReglesValidationAdminComponent {
  private readonly service = inject(AdminService);

  readonly pieces = PIECES;
  readonly competencesResource = rxResource({
    stream: () => this.service.competences(),
    defaultValue: [] as Competence[],
  });
  readonly competences = computed(() => this.competencesResource.value() ?? []);

  readonly competenceId = signal('');
  readonly rechercheCompetence = signal('');
  readonly competencesFiltrees = computed(() => {
    const q = this.rechercheCompetence().trim().toLocaleLowerCase();
    if (!q) return [];
    return this.competences().filter((c) => c.nom.toLocaleLowerCase().includes(q)
      || (c.metierNom ?? '').toLocaleLowerCase().includes(q)
      || (c.secteurNom ?? '').toLocaleLowerCase().includes(q)).slice(0, 12);
  });
  readonly competenceSelectionnee = computed(() => this.competences().find((c) => c.id === this.competenceId()));
  readonly regles = signal<RegleDraft[]>([]);
  readonly parDefaut = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');

  rechercher(value: string): void {
    this.rechercheCompetence.set(value);
    if (this.competenceSelectionnee()?.nom !== value) {
      this.competenceId.set('');
      this.regles.set([]);
      this.message.set('');
      this.error.set('');
    }
  }

  effacerSelection(): void {
    this.competenceId.set('');
    this.rechercheCompetence.set('');
    this.regles.set([]);
    this.message.set('');
    this.error.set('');
  }

  choisir(id: string): void {
    this.competenceId.set(id);
    this.rechercheCompetence.set(this.competences().find((c) => c.id === id)?.nom ?? '');
    this.message.set('');
    this.error.set('');
    this.regles.set([]);
    if (!id) return;
    this.loading.set(true);
    this.service.reglesValidation(id).subscribe({
      next: (regles) => { this.appliquer(regles); this.loading.set(false); },
      error: (e: Error) => { this.error.set(e?.message || 'Impossible de charger les règles.'); this.loading.set(false); },
    });
  }

  monter(i: number): void {
    if (i <= 0) return;
    const liste = [...this.regles()];
    [liste[i - 1], liste[i]] = [liste[i], liste[i - 1]];
    this.regles.set(liste);
  }

  descendre(i: number): void {
    const liste = [...this.regles()];
    if (i >= liste.length - 1) return;
    [liste[i + 1], liste[i]] = [liste[i], liste[i + 1]];
    this.regles.set(liste);
  }

  enregistrer(): void {
    const id = this.competenceId();
    if (!id) return;
    const corps: RegleValidationRequest[] = this.regles().map((r, i) => ({
      modalite: r.modalite,
      ordre: i,
      actif: r.actif,
      seuilReussite: r.modalite === 'TEST_NUMERIQUE' && r.seuilReussite !== null && r.seuilReussite !== undefined ? Number(r.seuilReussite) : null,
      piecesAdmissibles: r.modalite === 'DOCUMENTAIRE' ? PIECES.filter((p) => r.pieces[p.code]).map((p) => p.code) : [],
      profilsHabilites: r.profilsHabilites.trim() || null,
      criteres: r.criteres.trim() || null,
    }));
    this.saving.set(true);
    this.error.set('');
    this.service.enregistrerReglesValidation(id, corps).subscribe({
      next: (regles) => { this.appliquer(regles); this.message.set('Règles enregistrées.'); this.saving.set(false); },
      error: (e: Error) => { this.error.set(e?.message || 'Enregistrement impossible.'); this.saving.set(false); },
    });
  }

  reinitialiser(): void {
    const id = this.competenceId();
    if (!id) return;
    this.saving.set(true);
    this.error.set('');
    this.service.reinitialiserReglesValidation(id).subscribe({
      next: (regles) => { this.appliquer(regles); this.message.set('Règles par défaut rétablies.'); this.saving.set(false); },
      error: (e: Error) => { this.error.set(e?.message || 'Réinitialisation impossible.'); this.saving.set(false); },
    });
  }

  private appliquer(regles: RegleValidation[]): void {
    this.parDefaut.set(regles.length > 0 && regles.every((r) => r.parDefaut));
    this.regles.set(
      regles.map((r) => ({
        modalite: r.modalite,
        libelle: r.libelle,
        actif: r.actif,
        seuilReussite: r.seuilReussite,
        pieces: Object.fromEntries(PIECES.map((p) => [p.code, (r.piecesAdmissibles ?? []).includes(p.code)])),
        profilsHabilites: r.profilsHabilites ?? '',
        criteres: r.criteres ?? '',
      })),
    );
  }
}
