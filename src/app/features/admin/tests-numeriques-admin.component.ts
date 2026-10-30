import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import {
  AdminService,
  AdminTestNumerique,
  AdminTestRequest,
  AdminQuestionType,
} from '../../core/services/admin.service';
import { Competence } from '../../shared/models';
import { ConfirmationService } from '../../core/ui/confirmation.service';

interface PropositionDraft {
  texte: string;
  correcte: boolean;
}
interface QuestionDraft {
  texte: string;
  type: AdminQuestionType;
  propositions: PropositionDraft[];
}

@Component({
  selector: 'app-tests-numeriques-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Tests numériques" description="Composer les questions et propositions d’un test de compétence. Un test constitue une preuve de compétence, pas une certification officielle." />
    <section class="mc-card p-5 sm:p-6">
      @if (errorMessage()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3"><input class="mc-input max-w-sm" [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="Rechercher un test" aria-label="Rechercher un test" /><button class="btn btn-primary" type="button" (click)="nouveau()"><span aria-hidden="true">＋</span> Ajouter un test</button></div>
      @if (testsResource.isLoading()) { <p class="py-6 text-sm text-slate-500">Chargement des tests…</p> } @else if (!filtered().length) { <p class="py-6 text-sm text-slate-500">Aucun test numérique correspondant.</p> } @else { <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">@for (t of filtered(); track t.id) { <article class="flex min-h-44 flex-col rounded-xl border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"><div class="flex items-center justify-between"><span class="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"><svg viewBox="0 0 24 24" class="size-5" fill="none"><path d="M5 4.5h14v15H5zM8 8h8m-8 4h8m-8 4h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></span><span class="badge badge-sm" [class.badge-success]="t.statut === 'ACTIF' || t.statut === 'PUBLIE' || t.statut === 'PUBLIC'">{{ t.statut }}</span></div><h3 class="mt-4 font-semibold text-gray-900 dark:text-white">{{ t.titre }}</h3><p class="mt-1 line-clamp-2 text-sm text-gray-500">{{ t.description || 'Aucune description' }}</p><div class="mt-auto flex items-center justify-between pt-4"><span class="text-xs text-gray-500">{{ t.questions?.length ?? 0 }} question(s)</span><button class="btn btn-secondary btn-sm" type="button" (click)="editer(t)">Détails <span aria-hidden="true">→</span></button></div></article> }</div> }
      @if (editing()) {
        <dialog class="modal modal-open">
        <form class="modal-box max-w-3xl space-y-4" (ngSubmit)="enregistrer()">
          <div class="flex items-center justify-between gap-3"><h2 class="text-lg font-semibold">{{ editId() ? 'Modifier le test' : 'Nouveau test' }}</h2><button class="btn btn-ghost btn-sm" type="button" (click)="annuler()" aria-label="Fermer la fenêtre">✕</button></div>
          <div class="grid gap-3 md:grid-cols-2"><label class="text-sm font-medium">Titre *<input class="mc-input mt-1" name="testTitre" [(ngModel)]="form.titre" required /></label><label class="text-sm font-medium">Compétence *<select class="mc-input mt-1" name="testCompetence" [(ngModel)]="form.competenceId" required><option value="">Sélectionner une compétence</option>@for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label><label class="text-sm font-medium md:col-span-2">Description<textarea class="mc-input mt-1" name="testDescription" [(ngModel)]="form.description" rows="2"></textarea></label><label class="flex items-center gap-2 text-sm"><input type="checkbox" name="testActif" [(ngModel)]="form.actif" /> Test actif</label></div>
          <div class="space-y-4"><div class="flex items-center justify-between"><h3 class="font-semibold">Questions ({{ questions.length }})</h3><button class="btn btn-secondary btn-sm" type="button" (click)="ajouterQuestion()">Ajouter une question</button></div>
            @for (q of questions; track $index; let i = $index) { <article class="rounded-xl border border-slate-200 p-4"><div class="flex items-start justify-between gap-3"><h4 class="font-semibold">Question {{ i + 1 }}</h4><button class="btn btn-ghost btn-sm" type="button" (click)="retirerQuestion(i)">Retirer</button></div><label class="mt-2 block text-sm font-medium">Énoncé *<textarea class="mc-input mt-1" [name]="'question'+i" [(ngModel)]="q.texte" required rows="2"></textarea></label><label class="mt-3 block text-sm font-medium">Type<select class="mc-input mt-1" [name]="'type'+i" [(ngModel)]="q.type"><option value="CHOIX_UNIQUE">Choix unique</option><option value="CHOIX_MULTIPLE">Choix multiple</option><option value="VRAI_FAUX">Vrai / faux</option><option value="TEXTE_LIBRE">Texte libre</option></select></label>
              @if (q.type !== 'TEXTE_LIBRE') { <div class="mt-3 space-y-2"><div class="flex items-center justify-between"><span class="text-sm font-medium">Propositions</span><button class="btn btn-ghost btn-sm" type="button" (click)="ajouterProposition(q)">Ajouter</button></div>@for (p of q.propositions; track $index; let j = $index) { <div class="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"><input class="mc-input" [name]="'prop'+i+'-'+j" [(ngModel)]="p.texte" placeholder="Texte de la proposition" required /><label class="flex items-center gap-2 text-sm"><input type="checkbox" [name]="'correct'+i+'-'+j" [(ngModel)]="p.correcte" /> Bonne réponse</label><button class="btn btn-ghost btn-sm" type="button" (click)="q.propositions.splice(j,1)">Retirer</button></div> }</div> }
            </article> }
          </div>
          <div class="flex flex-wrap items-center justify-between gap-2"><div class="flex flex-wrap gap-2"><button class="btn btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : 'Enregistrer le test' }}</button><button class="btn btn-secondary" type="button" (click)="preview.set(!preview())">{{ preview() ? 'Fermer l’aperçu citoyen' : 'Aperçu citoyen' }}</button></div><div class="flex gap-2">@if (selectedTest()) { <button class="btn btn-ghost text-error-600" type="button" (click)="archiverDepuisEdition()">Archiver</button> }<button class="btn btn-ghost" type="button" (click)="annuler()">Annuler</button></div></div>
          @if (preview()) { <div class="rounded-xl bg-slate-50 p-4"><h3 class="font-semibold">Aperçu citoyen · {{ form.titre || 'Test sans titre' }}</h3><p class="mt-1 text-sm text-slate-600">{{ form.description }}</p>@for (q of questions; track $index; let i = $index) { <div class="mt-4"><p class="font-medium">{{ i + 1 }}. {{ q.texte }}</p>@if (q.type === 'TEXTE_LIBRE') { <div class="mt-2 h-12 rounded border border-slate-300 bg-white"></div> } @else { @for (p of q.propositions; track $index) { <p class="mt-1 text-sm">◯ {{ p.texte }}</p> } }</div> }<p class="mt-4 text-xs text-slate-500">L’aperçu ne révèle aucune bonne réponse.</p></div> }
        </form>
        </dialog>
      }
    </section>
  `,
})
export class TestsNumeriquesAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);

  readonly query = signal('');
  readonly editing = signal(false);
  readonly preview = signal(false);
  readonly editId = signal<string | null>(null);
  readonly selectedTest = signal<AdminTestNumerique | null>(null);
  readonly saving = signal(false);
  readonly actionError = signal('');
  readonly message = signal('');

  form = { titre: '', description: '', competenceId: '', actif: true };
  questions: QuestionDraft[] = [];

  readonly testsResource = rxResource({
    stream: () => this.service.testsNumeriques(),
    defaultValue: [] as AdminTestNumerique[],
  });

  readonly competencesResource = rxResource({
    stream: () => this.service.competences(),
    defaultValue: [] as Competence[],
  });

  readonly competences = computed(() => this.competencesResource.value() ?? []);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const list = this.testsResource.value() ?? [];
    return list.filter((t) => !q || `${t.titre} ${t.description ?? ''}`.toLocaleLowerCase().includes(q));
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.testsResource.error() as Error | undefined;
    return err?.message || '';
  }

  nouveau(): void {
    this.editId.set(null);
    this.selectedTest.set(null);
    this.form = { titre: '', description: '', competenceId: '', actif: true };
    this.questions = [];
    this.editing.set(true);
    this.preview.set(false);
    this.actionError.set('');
  }

  editer(t: AdminTestNumerique): void {
    this.editId.set(t.id);
    this.selectedTest.set(t);
    this.form = {
      titre: t.titre,
      description: t.description ?? '',
      competenceId: t.competenceId ?? '',
      actif: t.statut === 'ACTIF' || t.statut === 'PUBLIE' || t.statut === 'PUBLIC',
    };
    this.questions = (t.questions ?? []).map((q) => ({
      texte: q.libelle,
      type: q.type,
      propositions: (q.propositions ?? []).map((p) => ({
        texte: p.libelle,
        correcte: p.estCorrecte ?? false,
      })),
    }));
    this.editing.set(true);
    this.preview.set(false);
    this.actionError.set('');
  }

  ajouterQuestion(): void {
    this.questions.push({
      texte: '',
      type: 'CHOIX_UNIQUE',
      propositions: [
        { texte: '', correcte: true },
        { texte: '', correcte: false },
      ],
    });
  }

  retirerQuestion(i: number): void {
    this.questions.splice(i, 1);
  }

  ajouterProposition(q: QuestionDraft): void {
    q.propositions.push({ texte: '', correcte: false });
  }

  annuler(): void {
    this.editing.set(false);
    this.preview.set(false);
    this.editId.set(null);
    this.selectedTest.set(null);
  }

  async archiverDepuisEdition(): Promise<void> {
    const test = this.selectedTest();
    if (!test) return;
    await this.supprimer(test);
    this.annuler();
  }

  enregistrer(): void {
    this.actionError.set('');
    if (!this.form.titre.trim() || !this.form.competenceId) {
      this.actionError.set('Le titre et la compétence sont obligatoires.');
      return;
    }
    for (let i = 0; i < this.questions.length; i++) {
      const q = this.questions[i];
      if (!q.texte.trim()) {
        this.actionError.set(`L’énoncé de la question ${i + 1} est obligatoire.`);
        return;
      }
      if (q.type === 'CHOIX_UNIQUE' || q.type === 'VRAI_FAUX') {
        if (q.propositions.filter((p) => p.correcte).length !== 1) {
          this.actionError.set(`La question ${i + 1} doit avoir exactement une bonne réponse.`);
          return;
        }
        if (q.type === 'VRAI_FAUX' && q.propositions.length !== 2) {
          this.actionError.set(`La question vrai/faux ${i + 1} doit proposer exactement deux réponses.`);
          return;
        }
      } else if (q.type === 'CHOIX_MULTIPLE' && !q.propositions.some((p) => p.correcte)) {
        this.actionError.set(`La question ${i + 1} doit avoir au moins une bonne réponse.`);
        return;
      }
      if (
        q.type !== 'TEXTE_LIBRE' &&
        (q.propositions.length < 2 || q.propositions.some((p) => !p.texte.trim()))
      ) {
        this.actionError.set(`La question ${i + 1} doit avoir au moins deux propositions complètes.`);
        return;
      }
    }
    const body: AdminTestRequest = {
      competenceId: this.form.competenceId,
      titre: this.form.titre.trim(),
      description: this.form.description.trim(),
      actif: this.form.actif,
      questions: this.questions.map((q, i) => ({
        texte: q.texte.trim(),
        type: q.type,
        ordre: i + 1,
        ...(q.type === 'TEXTE_LIBRE'
          ? {}
          : {
              propositions: q.propositions.map((p) => ({
                texte: p.texte.trim(),
                correcte: p.correcte,
              })),
            }),
      })),
    };
    this.saving.set(true);
    const currentEditId = this.editId();
    const obs = currentEditId
      ? this.service.modifierTest(currentEditId, body)
      : this.service.creerTest(body);
    obs.subscribe({
      next: () => {
        this.message.set('Le test a été enregistré.');
        this.saving.set(false);
        this.editing.set(false);
        this.testsResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible d’enregistrer le test.');
        this.saving.set(false);
      },
    });
  }

  async supprimer(t: AdminTestNumerique): Promise<void> {
    const ok = await this.confirmation.confirm(`Archiver le test « ${t.titre} » ? Il ne sera plus proposé aux citoyens.`, { title: 'Archiver le test', confirmLabel: 'Archiver', danger: true });
    if (!ok) return;
    this.service.archiverTest(t.id).subscribe({
      next: () => {
        this.message.set('Test archivé.');
        this.testsResource.reload();
      },
      error: (e: Error) =>
        this.actionError.set(e.message || 'Impossible d’archiver le test.'),
    });
  }
}
