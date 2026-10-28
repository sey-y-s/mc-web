import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent, DonutChartComponent, BarChartComponent, ChartCategory, ChartSegment, MC_CHART } from '../../shared/components';
import { AdminService, InstitutionIndicateur } from '../../core/services/admin.service';

@Component({
  selector: 'app-institution-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent, DonutChartComponent, BarChartComponent],
  template: `
    <mc-page-header title="Tableau de bord institutionnel" description="Vue nationale agrégée des besoins et de l’offre de compétences." />
    @if (errorMessage()) { <div class="alert alert-warning text-gray-100 mb-5" role="alert">{{ errorMessage() }}</div> }
    <section class="mc-card mb-5 p-5"><label class="block max-w-md text-sm">Compétence<select class="mc-input mt-1" name="competenceId" [ngModel]="competenceId()" (ngModelChange)="competenceId.set($event); charger()"><option value="">Choisir</option>@for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label><p class="mt-2 text-xs opacity-70">Indicateurs calculés au moment de la consultation. Une tension signale une demande supérieure à l’offre.</p>@if (loading()) { <p class="mt-2 text-sm" role="status">Calcul en cours…</p> }</section>
    @if (resultat()) {
    <section class="grid gap-5 lg:grid-cols-[1fr_1.5fr]">
      <article class="mc-card p-5">
        <h2 class="mc-section-heading">Données publiables</h2>
        <p class="mt-1 text-sm opacity-70">Cellules affichées ou masquées pour protéger les petits effectifs.</p>
        <div class="mt-5"><mc-donut-chart [segments]="segmentsCellules()" centerLabel="cellules" [legendSide]="false" [size]="170" ariaLabel="Cellules visibles et masquées" /></div>
      </article>
      <article class="mc-card p-5">
        <h2 class="mc-section-heading">Offre et demande dans les zones en tension</h2>
        <p class="mt-1 text-sm opacity-70">{{ resultat()!.competencesEnTension.length }} tension(s) classée(s) parmi les cellules publiables.</p>
        @if (categoriesTensions().length) {
          <mc-bar-chart [categories]="categoriesTensions()" [series]="seriesOffreDemande" [height]="220" ariaLabel="Offre et demande dans les zones en tension" />
        } @else {
          <p class="mt-6 text-sm opacity-70">Aucune tension publiable pour cette compétence.</p>
        }
      </article>
    </section>
    <section class="mc-card mt-5 p-5"><h2 class="mc-section-heading">Tensions les plus élevées parmi les cellules publiables</h2>@if (!resultat()!.competencesEnTension.length) { <p class="mt-3 text-sm opacity-70">Aucune tension publiable pour cette compétence.</p> } @else { <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Région</th><th>Compétence</th><th>Offre</th><th>Demande</th><th>Écart</th></tr></thead><tbody>@for (r of resultat()!.competencesEnTension; track r.regionCode + r.competenceId) { <tr><td>{{ r.regionNom }}</td><td>{{ r.competenceNom }}</td><td>{{ valeur(r.offre) }}</td><td>{{ valeur(r.demande) }}</td><td>{{ valeur(r.ecart) }}</td></tr> }</tbody></table></div> }</section> }
    <div class="mt-5 flex flex-wrap gap-3"><a class="btn btn-outline" routerLink="/app/institution/skills-gap">Explorer le Skills-Gap</a><a class="btn btn-outline" routerLink="/app/institution/carte">Voir la carte territoriale</a></div>
  `,
})
export class InstitutionDashboardComponent {
  private readonly service = inject(AdminService);

  readonly competenceId = signal('');
  readonly loading = signal(false);
  readonly actionError = signal('');
  readonly resultat = signal<{
    cellulesVisibles: number;
    cellulesMasquees: number;
    competencesEnTension: InstitutionIndicateur[];
  } | null>(null);

  readonly competencesResource = rxResource({
    stream: () => this.service.institutionCompetences(),
    defaultValue: [] as Array<{ id: string; nom: string }>,
  });

  readonly competences = computed(() => this.competencesResource.value() ?? []);

  readonly seriesOffreDemande = [
    { name: 'Offre', color: MC_CHART.vert },
    { name: 'Demande', color: MC_CHART.or },
  ];

  segmentsCellules(): ChartSegment[] {
    const r = this.resultat();
    return [
      { label: 'Visibles', value: r?.cellulesVisibles ?? 0, color: MC_CHART.vert },
      { label: 'Masquées (confidentialité)', value: r?.cellulesMasquees ?? 0, color: MC_CHART.gris },
    ];
  }

  categoriesTensions(): ChartCategory[] {
    return (this.resultat()?.competencesEnTension ?? [])
      .filter((r) => r.offre != null && r.demande != null)
      .slice(0, 6)
      .map((r) => ({ label: r.regionNom ?? r.regionCode, hint: r.competenceNom ?? undefined, values: [r.offre ?? 0, r.demande ?? 0] }));
  }

  valeur(v: number | null): string {
    return v == null ? 'Masqué' : String(v);
  }

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.competencesResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? '';
  }

  charger(): void {
    this.actionError.set('');
    this.resultat.set(null);
    if (!this.competenceId()) return;
    this.loading.set(true);
    this.service
      .institutionDashboard(this.competenceId())
      .subscribe({
        next: (r) => {
          this.resultat.set(r);
          this.loading.set(false);
        },
        error: (e) => {
          this.actionError.set(
            e.error?.message ?? e.message ?? 'Impossible de charger le tableau de bord.'
          );
          this.loading.set(false);
        },
      });
  }
}
