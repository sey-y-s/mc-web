import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { SkillsGapCalcule, SkillsGapService } from '../../core/services/skills-gap.service';

/**
 * Skills-Gap calculé À LA DEMANDE (consignes V1.2) : plus de saisie manuelle ni de snapshots.
 * Offre = personnes distinctes ayant la compétence validée et valable ; demande = personnes recherchées
 * dans les besoins ouverts ; écart = offre − demande.
 */
@Component({
  selector: 'app-skills-gap-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, DatePipe],
  template: `
    <mc-page-header title="Skills-Gap" description="Offre et demande de compétences par territoire, calculées en direct." />
    <section class="mc-card p-5 sm:p-6">
      @if (erreur()) { <p class="mb-3 text-sm text-error" role="alert">{{ erreur() }}</p> }
      <div class="grid gap-3 md:grid-cols-3">
        <label class="text-sm">Compétence
          <select class="mc-input mt-1" [ngModel]="competence()" (ngModelChange)="competence.set($event)">
            <option value="">Toutes les compétences</option>
            @for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
          </select>
        </label>
        <label class="text-sm">Territoire
          <select class="mc-input mt-1" [ngModel]="territoire()" (ngModelChange)="territoire.set($event)">
            <option value="">National et régions</option>
            <option value="NATIONAL">Mali (national) seulement</option>
            @for (t of territoires(); track t) { <option [value]="t">{{ t }}</option> }
          </select>
        </label>
        <label class="flex cursor-pointer items-center gap-2 self-end pb-2 text-sm">
          <input type="checkbox" class="checkbox checkbox-sm" [ngModel]="penuriesSeulement()" (ngModelChange)="penuriesSeulement.set($event)" />
          Pénuries seulement (demande &gt; offre)
        </label>
      </div>
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-base-content/70">
          {{ lignes().length }} ligne(s)
          @if (resultat(); as r) { · calculé le {{ r.calculeLe | date: 'dd/MM/yyyy HH:mm' }} }
        </p>
        <div class="flex gap-2">
          <button class="btn btn-ghost btn-sm" type="button" (click)="resource.reload()" [disabled]="resource.isLoading()">Recalculer</button>
          <button class="btn btn-secondary btn-sm" type="button" (click)="exportCsv()" [disabled]="!lignes().length">Exporter CSV</button>
        </div>
      </div>
      @if (resource.isLoading()) { <p class="py-8 text-sm text-base-content/60" role="status">Calcul des indicateurs…</p> }
      @else if (!lignes().length) { <p class="py-8 text-sm text-base-content/60">Aucune compétence validée ni besoin ouvert pour ces critères.</p> }
      @else {
        <div class="mt-3 overflow-x-auto">
          <table class="table w-full">
            <thead><tr><th>Compétence</th><th>Territoire</th><th class="text-right">Offre</th><th class="text-right">Demande</th><th class="text-right">Écart</th></tr></thead>
            <tbody>
              @for (x of lignes(); track x.competenceId + (x.regionId ?? 'national')) {
                <tr [class.font-semibold]="!x.regionId">
                  <td>{{ x.competenceNom }}</td>
                  <td>{{ x.regionNom }}</td>
                  <td class="text-right tabular-nums">{{ x.offre }}</td>
                  <td class="text-right tabular-nums">{{ x.demande }}</td>
                  <td class="text-right tabular-nums"><span [class.text-error]="x.ecart < 0" [class.text-success]="x.ecart > 0">{{ x.ecart > 0 ? '+' : '' }}{{ x.ecart }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
      @if (resultat(); as r) {
        <details class="mt-4 text-xs text-base-content/70">
          <summary class="cursor-pointer font-medium">Comment ces chiffres sont calculés</summary>
          <p class="mt-2">{{ r.criteres }}</p>
          <p class="mt-1">{{ r.limites }}</p>
        </details>
      }
    </section>
  `,
})
export class SkillsGapAdminComponent {
  private readonly service = inject(SkillsGapService);

  readonly competence = signal('');
  readonly territoire = signal('');
  readonly penuriesSeulement = signal(false);

  readonly resource = rxResource({ stream: () => this.service.calculer() });
  readonly resultat = computed<SkillsGapCalcule | undefined>(() => this.resource.value());

  readonly competences = computed(() => {
    const vus = new Map<string, string>();
    for (const l of this.resultat()?.lignes ?? []) vus.set(l.competenceId, l.competenceNom);
    return [...vus.entries()].map(([id, nom]) => ({ id, nom })).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  });

  readonly territoires = computed(() =>
    [...new Set((this.resultat()?.lignes ?? []).filter((l) => l.regionId).map((l) => l.regionNom))].sort((a, b) => a.localeCompare(b, 'fr')),
  );

  readonly lignes = computed(() => {
    const c = this.competence();
    const t = this.territoire();
    return (this.resultat()?.lignes ?? []).filter(
      (l) =>
        (!c || l.competenceId === c) &&
        (!t || (t === 'NATIONAL' ? !l.regionId : l.regionNom === t)) &&
        (!this.penuriesSeulement() || l.ecart < 0),
    );
  });

  erreur(): string {
    const e = this.resource.error() as { error?: { message?: string }; message?: string } | undefined;
    return e ? (e.error?.message ?? e.message ?? 'Indicateurs indisponibles.') : '';
  }

  exportCsv(): void {
    const quote = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['competence', 'territoire', 'offre', 'demande', 'ecart_offre_moins_demande'],
      ...this.lignes().map((x) => [x.competenceNom, x.regionNom, x.offre, x.demande, x.ecart]),
    ];
    const csv = '﻿' + rows.map((row) => row.map(quote).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skills-gap.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
