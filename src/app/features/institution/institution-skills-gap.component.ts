import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, InstitutionIndicateur } from '../../core/services/admin.service';

@Component({
  selector: 'app-institution-skills-gap',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Skills-Gap institutionnel" description="Offre, demande et écart par région, calculés au moment de la consultation." />
    <section class="mc-card mb-5 p-5 sm:p-6">
      @if (errorMessage()) { <div class="alert alert-warning text-gray-100 mb-4" role="alert"><div><strong>Indicateurs indisponibles</strong><p class="mt-1 text-sm">{{ errorMessage() }}</p></div></div> }
      <label class="block max-w-md text-sm">Compétence<select class="mc-input mt-1" name="competenceId" [ngModel]="competenceId()" (ngModelChange)="competenceId.set($event); rechercher()"><option value="">Choisir une compétence</option>@for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label>
      <p class="mt-3 text-xs opacity-70">Les résultats s’affichent dès le choix de la compétence. Offre : personnes distinctes ayant la compétence validée et valable. Demande : personnes recherchées dans les besoins ouverts. Écart = offre − demande (négatif : pénurie). Les groupes de moins de 5 personnes sont masqués.</p>
    </section>
    <section class="mc-card p-5 sm:p-6">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 class="mc-section-heading">Résultats agrégés</h2><button class="btn btn-secondary" type="button" [disabled]="!items.length || loading()" (click)="exporter()">Exporter CSV sécurisé</button></div>
      @if (loading() && !items.length) { <p class="py-8" role="status">Chargement des indicateurs autorisés…</p> }
      @else if (!items.length) { <p class="py-8 text-sm opacity-70">Choisissez une compétence pour afficher les indicateurs.</p> }
      @else { <div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Région</th><th>Compétence</th><th>Calculé le</th><th>Offre</th><th>Demande</th><th>Écart</th><th>Confidentialité</th></tr></thead><tbody>@for (row of items; track row.regionCode + row.competenceId + row.periodeDebut) { <tr><td>{{ row.regionNom }}<span class="block text-xs opacity-60">{{ row.regionCode }}</span></td><td>{{ row.competenceNom }}</td><td>{{ row.periodeDebut }}</td><td>{{ valeur(row.offre) }}</td><td>{{ valeur(row.demande) }}</td><td>{{ valeur(row.ecart) }}</td><td>{{ row.statutConfidentialite }}@if (row.motifMasquage) { <span class="block text-xs opacity-70">{{ row.motifMasquage }}</span> }</td></tr> }</tbody></table></div> }
    </section>
  `,
})
export class InstitutionSkillsGapComponent {
  private readonly service = inject(AdminService);

  readonly competenceId = signal('');
  readonly loading = signal(false);
  readonly actionError = signal('');
  items: InstitutionIndicateur[] = [];

  readonly competencesResource = rxResource({
    stream: () => this.service.institutionCompetences(),
    defaultValue: [] as Array<{ id: string; nom: string }>,
  });

  readonly competences = computed(() => this.competencesResource.value() ?? []);

  valeur(v: number | null): string {
    return v === null || v === undefined ? 'Masqué' : String(v);
  }

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.competencesResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? '';
  }

  rechercher(): void {
    this.actionError.set('');
    if (!this.competenceId()) { this.items = []; return; }
    this.loading.set(true);
    this.items = [];
    this.service
      .institutionSkillsGap(this.competenceId())
      .subscribe({
        next: (rows) => {
          this.items = rows ?? [];
          this.loading.set(false);
        },
        error: (e) => {
          this.actionError.set(
            e.error?.message ?? e.message ?? 'Impossible de charger les indicateurs agrégés.'
          );
          this.loading.set(false);
        },
      });
  }

  exporter(): void {
    if (!this.competenceId()) return;
    this.service
      .exporterInstitutionSkillsGap(this.competenceId())
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'skills-gap-agrege.csv';
          a.click();
          URL.revokeObjectURL(url);
        },
        error: (e) =>
          this.actionError.set(e.error?.message ?? e.message ?? 'Export indisponible.'),
      });
  }
}
