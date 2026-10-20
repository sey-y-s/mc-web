import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, RegionAdmin } from '../../core/services/admin.service';
import { SkillsGap, Competence } from '../../shared/models';

@Component({
  selector: 'app-skills-gap-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Skills-Gap" description="Comparer la demande estimée et l’offre disponible par région et compétence." />
    <section class="mc-card p-5 sm:p-6">
      @if (errorMessage()) { <p class="mb-3 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      <div class="grid gap-3 md:grid-cols-3">
        <select class="mc-input" [ngModel]="regionId()" (ngModelChange)="regionId.set($event)" aria-label="Filtrer par région">
          <option value="">Toutes les régions</option>
          @for (r of regions(); track r.id) { <option [value]="r.id">{{ r.nom }}</option> }
        </select>
        <select class="mc-input" [ngModel]="competenceId()" (ngModelChange)="competenceId.set($event)" aria-label="Filtrer par compétence">
          <option value="">Toutes les compétences</option>
          @for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
        </select>
        <div class="grid grid-cols-2 gap-2">
          <input class="mc-input" type="date" [ngModel]="periodeDebut()" (ngModelChange)="periodeDebut.set($event)" aria-label="Début de période" />
          <input class="mc-input" type="date" [ngModel]="periodeFin()" (ngModelChange)="periodeFin.set($event)" aria-label="Fin de période" />
        </div>
      </div>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-slate-600">{{ filtered().length }} indicateur(s) correspondant(s)</p>
        <div class="flex gap-2">
          <button class="btn btn-secondary" (click)="exportCsv()" [disabled]="!filtered().length">Exporter CSV</button>
          <button class="btn btn-primary" (click)="formOpen.set(!formOpen())">Nouvel indicateur</button>
        </div>
      </div>
      @if (formOpen()) {
        <form class="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 md:grid-cols-2" (ngSubmit)="creerIndicateur()">
          <label class="text-sm font-medium">Région *<select class="mc-input mt-1" name="newRegion" [(ngModel)]="form.regionId" required><option value="">Sélectionner une région</option>@for (r of regions(); track r.id) { <option [value]="r.id">{{ r.nom }}</option> }</select></label>
          <label class="text-sm font-medium">Compétence *<select class="mc-input mt-1" name="newCompetence" [(ngModel)]="form.competenceId" required><option value="">Sélectionner une compétence</option>@for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label>
          <label class="text-sm font-medium">Période début *<input class="mc-input mt-1" type="date" name="newStart" [(ngModel)]="form.periodeDebut" required /></label>
          <label class="text-sm font-medium">Période fin *<input class="mc-input mt-1" type="date" name="newEnd" [(ngModel)]="form.periodeFin" required /></label>
          <label class="text-sm font-medium">Demande estimée *<input class="mc-input mt-1" type="number" min="0" step="1" name="newDemand" [(ngModel)]="form.demandeEstimee" required /></label>
          <label class="text-sm font-medium">Offre disponible *<input class="mc-input mt-1" type="number" min="0" step="1" name="newSupply" [(ngModel)]="form.offreDisponible" required /></label>
          <div class="flex gap-2 md:col-span-2"><button class="btn btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : 'Créer l’indicateur' }}</button><button class="btn btn-secondary" type="button" (click)="formOpen.set(false)">Annuler</button></div>
          <p class="text-xs text-slate-500 md:col-span-2">La demande et l’offre sont saisies manuellement ; l’écart est calculé à partir de ces valeurs.</p>
        </form>
      }
      @if (indicateursResource.isLoading()) { <p class="py-8 text-sm text-slate-500">Chargement des indicateurs…</p> }
      @else if (!filtered().length) { <p class="py-8 text-sm text-slate-500">Aucun indicateur disponible pour ces filtres. Le calcul automatique n’est pas supposé exister sans API dédiée.</p> }
      @else {
        <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Compétence</th><th>Territoire</th><th>Période</th><th>Demande</th><th>Offre</th><th>Écart</th></tr></thead><tbody>@for (x of filtered(); track x.id) { <tr><td>{{ x.competenceNom || x.competenceId }}</td><td>{{ x.regionNom || x.regionId }}</td><td>{{ x.periodeDebut }} – {{ x.periodeFin }}</td><td>{{ x.demandeEstimee }}</td><td>{{ x.offreDisponible }}</td><td><span class="font-semibold" [class.text-red-700]="x.ecart < 0" [class.text-emerald-800]="x.ecart > 0">{{ x.ecart }}</span></td></tr> }</tbody></table></div>
      }
    </section>
  `,
})
export class SkillsGapAdminComponent {
  private readonly service = inject(AdminService);

  readonly regionId = signal('');
  readonly competenceId = signal('');
  readonly periodeDebut = signal('');
  readonly periodeFin = signal('');
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly actionError = signal('');

  form = {
    regionId: '',
    competenceId: '',
    periodeDebut: '',
    periodeFin: '',
    demandeEstimee: 0,
    offreDisponible: 0,
  };

  readonly indicateursResource = rxResource({
    stream: () => this.service.skillsGap(),
    defaultValue: [] as SkillsGap[],
  });

  readonly regionsResource = rxResource({
    stream: () => this.service.regions(),
    defaultValue: [] as RegionAdmin[],
  });

  readonly competencesResource = rxResource({
    stream: () => this.service.competences(),
    defaultValue: [] as Competence[],
  });

  readonly regions = computed(() => this.regionsResource.value() ?? []);
  readonly competences = computed(() => this.competencesResource.value() ?? []);

  readonly filtered = computed(() => {
    const rId = this.regionId();
    const cId = this.competenceId();
    const deb = this.periodeDebut();
    const fin = this.periodeFin();
    const list = this.indicateursResource.value() ?? [];
    return list
      .filter(
        (x) =>
          (!rId || x.regionId === rId) &&
          (!cId || x.competenceId === cId) &&
          (!deb || x.periodeFin >= deb) &&
          (!fin || x.periodeDebut <= fin)
      )
      .sort((a, b) => a.ecart - b.ecart);
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.indicateursResource.error() as Error | undefined;
    return err?.message || '';
  }

  creerIndicateur(): void {
    const f = this.form;
    if (!f.regionId || !f.competenceId || !f.periodeDebut || !f.periodeFin) {
      this.actionError.set('La région, la compétence et les deux dates sont obligatoires.');
      return;
    }
    if (f.periodeFin < f.periodeDebut) {
      this.actionError.set('La période de fin doit être supérieure ou égale à la période de début.');
      return;
    }
    if (
      !Number.isInteger(f.demandeEstimee) ||
      !Number.isInteger(f.offreDisponible) ||
      f.demandeEstimee < 0 ||
      f.offreDisponible < 0
    ) {
      this.actionError.set('La demande et l’offre doivent être des entiers positifs ou nuls.');
      return;
    }
    this.saving.set(true);
    this.actionError.set('');
    this.service.creerSkillsGap(f).subscribe({
      next: () => {
        this.form = {
          regionId: '',
          competenceId: '',
          periodeDebut: '',
          periodeFin: '',
          demandeEstimee: 0,
          offreDisponible: 0,
        };
        this.formOpen.set(false);
        this.saving.set(false);
        this.indicateursResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible de créer l’indicateur.');
        this.saving.set(false);
      },
    });
  }

  exportCsv(): void {
    const quote = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      [
        'competence',
        'region',
        'periode_debut',
        'periode_fin',
        'demande_estimee',
        'offre_disponible',
        'ecart',
      ],
      ...this.filtered().map((x) => [
        x.competenceNom || x.competenceId,
        x.regionNom || x.regionId,
        x.periodeDebut,
        x.periodeFin,
        x.demandeEstimee,
        x.offreDisponible,
        x.ecart,
      ]),
    ];
    const csv = '\uFEFF' + rows.map((row) => row.map(quote).join(';')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills-gap.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
