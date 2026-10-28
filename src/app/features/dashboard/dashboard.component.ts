import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent, StatusBadgeComponent, DonutChartComponent, BarChartComponent, HBarChartComponent, ChartCategory, ChartSegment, MC_CHART } from '../../shared/components';
import { SkillsGapService } from '../../core/services/skills-gap.service';
import { SkillsGap } from '../../shared/models';
import { AuthService } from '../../core/auth/auth.service';
import { MaliMapComponent } from './mali-map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, StatusBadgeComponent, MaliMapComponent, DonutChartComponent, BarChartComponent, HBarChartComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly skillsGap = inject(SkillsGapService);
  readonly auth = inject(AuthService);
  readonly dataResource = rxResource({ stream: () => this.skillsGap.lister() });
  get data(): SkillsGap[] { return this.dataResource.value() ?? []; }
  get loading(): boolean { return this.dataResource.isLoading(); }
  get error(): string {
    const err = this.dataResource.error() as { error?: { message?: string }; message?: string } | undefined;
    return err ? (err.error?.message ?? err.message ?? 'Les indicateurs sont momentanément indisponibles.') : '';
  }
  get totalDemand() {
    return this.data.reduce((s, x) => s + x.demandeEstimee, 0);
  }
  get totalOffer() {
    return this.data.reduce((s, x) => s + x.offreDisponible, 0);
  }
  get totalGap() {
    return this.data.reduce((s, x) => s + x.ecart, 0);
  }
  top() {
    // Écart = offre − demande : les pénuries (écarts négatifs) les plus fortes d'abord.
    return [...this.data].filter((x) => x.ecart < 0).sort((a, b) => a.ecart - b.ecart).slice(0, 5);
  }
  max() {
    return Math.max(1, ...this.data.map((x) => Math.max(x.demandeEstimee, x.offreDisponible)));
  }

  readonly C = MC_CHART;
  readonly seriesOffreDemande = [
    { name: 'Offre (talents validés)', color: MC_CHART.vert },
    { name: 'Demande (besoins ouverts)', color: MC_CHART.or },
  ];

  /** Taux de couverture de la demande par l'offre (en %). */
  couverture(): number | null {
    return this.totalDemand ? Math.round((Math.min(this.totalOffer, this.totalDemand) / this.totalDemand) * 100) : null;
  }

  /** Anneau : demande couverte par les talents validés / talents manquants. */
  segmentsCouverture(): ChartSegment[] {
    const couverte = Math.min(this.totalOffer, this.totalDemand);
    const manque = Math.max(0, this.totalDemand - this.totalOffer);
    const surplus = Math.max(0, this.totalOffer - this.totalDemand);
    return [
      { label: 'Demande couverte', value: couverte, color: MC_CHART.vert },
      { label: 'Talents manquants', value: manque, color: MC_CHART.rouge },
      ...(surplus ? [{ label: 'Talents en plus', value: surplus, color: MC_CHART.or }] : []),
    ];
  }

  /** Histogramme : les 6 couples compétence × territoire les plus demandés. */
  categoriesOffreDemande(): ChartCategory[] {
    return [...this.data]
      .sort((a, b) => b.demandeEstimee + b.offreDisponible - (a.demandeEstimee + a.offreDisponible))
      .slice(0, 6)
      .map((x) => ({ label: x.competenceNom ?? x.competenceId, hint: x.regionNom ?? 'Tout le Mali', values: [x.offreDisponible, x.demandeEstimee] }));
  }

  /** Classement des plus fortes pénuries (talents manquants). */
  categoriesTension(): ChartCategory[] {
    return this.top().map((x) => ({ label: x.competenceNom ?? x.competenceId, hint: x.regionNom ?? undefined, values: [Math.abs(x.ecart)] }));
  }

  /** Écart offre − demande cumulé par région (négatif = pénurie). */
  categoriesRegions(): ChartCategory[] {
    const m = new Map<string, number>();
    for (const x of this.data) {
      const k = x.regionNom ?? 'Tout le Mali';
      m.set(k, (m.get(k) ?? 0) + x.ecart);
    }
    return [...m.entries()].sort((a, b) => a[1] - b[1]).slice(0, 8).map(([label, v]) => ({ label, values: [v] }));
  }
}
