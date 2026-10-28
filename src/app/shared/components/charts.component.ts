import { Component, computed, input, signal } from '@angular/core';

/**
 * Graphiques légers en SVG / CSS, sans bibliothèque externe :
 * - <mc-donut-chart>  : diagramme en anneau (répartition, parts) ;
 * - <mc-bar-chart>    : histogramme vertical, une ou plusieurs séries côte à côte ;
 * - <mc-hbar-chart>   : barres horizontales (classements), empilées ou avec valeurs négatives.
 * Couleurs de la charte, animation à l'apparition, lecture accessible (valeurs en texte).
 */

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
}
export interface ChartSerie {
  name: string;
  color: string;
}
export interface ChartCategory {
  label: string;
  /** Précision affichée sous le libellé (ex. la région). */
  hint?: string;
  values: number[];
}

/** Palette de la charte MaliCompétences pour les graphiques. */
export const MC_CHART = {
  vert: '#15553b',
  vertClair: '#5f9f7f',
  or: '#c79a2b',
  orFonce: '#946c18',
  bleu: '#245d78',
  rouge: '#b42318',
  gris: '#c9cfc8',
  piste: '#eceee8',
};

const fr = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
export function formatNombre(v: number): string {
  return fr.format(v);
}

/** Maximum « rond » pour les graduations (1, 2, 2,5, 5 × 10ⁿ). */
export function maxArrondi(v: number): number {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 2, 2.5, 5, 10]) if (v <= m * p) return m * p;
  return 10 * p;
}

/* ------------------------------------------------------------------ */
/* Anneau                                                              */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'mc-donut-chart',
  standalone: true,
  template: `
    <div class="mc-donut" [class.mc-donut-row]="legendSide()">
      <div class="mc-donut-figure" [style.width.px]="size()" [style.height.px]="size()">
        <svg viewBox="0 0 100 100" role="img" [attr.aria-label]="resume()">
          <circle cx="50" cy="50" [attr.r]="R" fill="none" [attr.stroke]="piste" [attr.stroke-width]="epaisseur()" />
          @for (a of arcs(); track a.label) {
            <circle class="mc-donut-arc" cx="50" cy="50" [attr.r]="R" fill="none"
              [attr.stroke]="a.color" [attr.stroke-width]="actif() === a.label ? epaisseur() + 3 : epaisseur()"
              [attr.stroke-dasharray]="a.dash" [attr.stroke-dashoffset]="a.offset"
              transform="rotate(-90 50 50)" (mouseenter)="actif.set(a.label)" (mouseleave)="actif.set(null)">
              <title>{{ a.label }} : {{ nombre(a.value) }} ({{ a.pct }} %)</title>
            </circle>
          }
        </svg>
        <div class="mc-donut-center" aria-hidden="true">
          @if (segmentActif(); as s) {
            <span class="mc-donut-value">{{ s.pct }} %</span>
            <span class="mc-donut-caption">{{ s.label }}</span>
          } @else {
            <span class="mc-donut-value">{{ centerValue() ?? nombre(total()) }}</span>
            <span class="mc-donut-caption">{{ centerLabel() }}</span>
          }
        </div>
      </div>
      <ul class="mc-legend">
        @for (a of arcs(); track a.label) {
          <li (mouseenter)="actif.set(a.label)" (mouseleave)="actif.set(null)" [class.is-actif]="actif() === a.label">
            <span class="mc-legend-dot" [style.background]="a.color"></span>
            <span class="mc-legend-label">{{ a.label }}</span>
            <span class="mc-legend-value">{{ nombre(a.value) }}</span>
            <span class="mc-legend-pct">{{ a.pct }} %</span>
          </li>
        }
      </ul>
    </div>
  `,
})
export class DonutChartComponent {
  readonly segments = input<ChartSegment[]>([]);
  readonly centerLabel = input('');
  readonly centerValue = input<string | null>(null);
  readonly size = input(168);
  readonly thickness = input(13);
  readonly legendSide = input(true);
  readonly ariaLabel = input('');

  readonly R = 40;
  readonly piste = MC_CHART.piste;
  readonly actif = signal<string | null>(null);
  private readonly C = 2 * Math.PI * 40;

  readonly epaisseur = computed(() => this.thickness());
  readonly total = computed(() => this.segments().reduce((s, x) => s + Math.max(0, x.value || 0), 0));

  readonly arcs = computed(() => {
    const total = this.total();
    let cumul = 0;
    const gap = this.segments().filter((s) => s.value > 0).length > 1 ? 0.8 : 0;
    return this.segments().map((s) => {
      const v = Math.max(0, s.value || 0);
      const part = total ? v / total : 0;
      const long = Math.max(0, part * this.C - gap);
      const arc = {
        ...s,
        value: v,
        pct: total ? Math.round(part * 1000) / 10 : 0,
        dash: `${long} ${this.C - long}`,
        offset: -cumul * this.C,
      };
      cumul += part;
      return arc;
    });
  });

  readonly segmentActif = computed(() => this.arcs().find((a) => a.label === this.actif()) ?? null);

  readonly resume = computed(() => {
    const t = this.ariaLabel() || 'Répartition';
    return `${t} : ` + this.arcs().map((a) => `${a.label} ${this.nombre(a.value)} (${a.pct} %)`).join(', ');
  });

  nombre(v: number): string {
    return formatNombre(v);
  }
}

/* ------------------------------------------------------------------ */
/* Histogramme vertical                                                */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'mc-bar-chart',
  standalone: true,
  template: `
    @if (series().length > 1) {
      <ul class="mc-legend mc-legend-inline" aria-hidden="true">
        @for (s of series(); track s.name) {
          <li><span class="mc-legend-dot" [style.background]="s.color"></span><span class="mc-legend-label">{{ s.name }}</span></li>
        }
      </ul>
    }
    <div class="mc-bars" role="img" [attr.aria-label]="resume()" [style.--mc-h.px]="height()">
      <div class="mc-bars-grid" aria-hidden="true">
        @for (g of graduations(); track g) {
          <div class="mc-bars-line" [style.bottom.%]="(g / max()) * 100"><span>{{ nombre(g) }}</span></div>
        }
      </div>
      <div class="mc-bars-plot">
        @for (c of categories(); track c.label + (c.hint ?? ''); let i = $index) {
          <div class="mc-bars-group">
            <div class="mc-bars-cols">
              @for (v of c.values; track $index; let j = $index) {
                <div class="mc-bars-col" [style.height.%]="(v / max()) * 100" [style.background]="series()[j]?.color"
                  [style.animation-delay.ms]="i * 60 + j * 30" [attr.title]="c.label + ' — ' + (series()[j]?.name ?? '') + ' : ' + nombre(v)">
                  <span class="mc-bars-val">{{ nombre(v) }}</span>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
    <div class="mc-bars-labels" aria-hidden="true">
      @for (c of categories(); track c.label + (c.hint ?? '')) {
        <div class="mc-bars-label">
          <span class="mc-bars-label-main" [attr.title]="c.label">{{ court(c.label) }}</span>
          @if (c.hint) { <span class="mc-bars-label-hint">{{ c.hint }}</span> }
        </div>
      }
    </div>
  `,
})
export class BarChartComponent {
  readonly categories = input<ChartCategory[]>([]);
  readonly series = input<ChartSerie[]>([{ name: 'Valeur', color: MC_CHART.vert }]);
  readonly height = input(220);
  readonly ariaLabel = input('Histogramme');

  /** Pas de graduation « rond » (entier), 3 à 6 graduations. */
  private readonly pas = computed(() => {
    const brut = Math.max(0, ...this.categories().flatMap((c) => c.values));
    if (brut <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(brut / 4)));
    for (const m of [1, 2, 2.5, 5, 10, 20]) {
      const pas = Math.max(1, m * p);
      if (Math.ceil(brut / pas) <= 6) return pas;
    }
    return Math.max(1, 20 * p);
  });
  readonly max = computed(() => {
    const brut = Math.max(0, ...this.categories().flatMap((c) => c.values));
    return Math.max(this.pas(), Math.ceil(brut / this.pas()) * this.pas());
  });
  readonly graduations = computed(() => {
    const out: number[] = [];
    for (let v = 0; v <= this.max() + 1e-9; v += this.pas()) out.push(v);
    return out;
  });
  readonly resume = computed(
    () =>
      `${this.ariaLabel()} : ` +
      this.categories()
        .map((c) => `${c.label}${c.hint ? ' (' + c.hint + ')' : ''} ` + c.values.map((v, j) => `${this.series()[j]?.name ?? ''} ${this.nombre(v)}`).join(', '))
        .join(' ; '),
  );

  nombre(v: number): string {
    return formatNombre(v);
  }

  /** Libellé raccourci sous les barres (le libellé complet reste en info-bulle). */
  court(label: string): string {
    const mots = label.split(/\s+/);
    let out = '';
    for (const m of mots) {
      if ((out + ' ' + m).trim().length > 21) break;
      out = (out + ' ' + m).trim();
    }
    return out ? (out.length < label.length ? out + '…' : out) : label.slice(0, 12) + '…';
  }
}

/* ------------------------------------------------------------------ */
/* Barres horizontales (classement)                                    */
/* ------------------------------------------------------------------ */
@Component({
  selector: 'mc-hbar-chart',
  standalone: true,
  template: `
    @if (series().length > 1) {
      <ul class="mc-legend mc-legend-inline" aria-hidden="true">
        @for (s of series(); track s.name) {
          <li><span class="mc-legend-dot" [style.background]="s.color"></span><span class="mc-legend-label">{{ s.name }}</span></li>
        }
      </ul>
    }
    <ul class="mc-hbars" [class.mc-hbars-diverge]="diverge()" [attr.aria-label]="ariaLabel()">
      @for (c of categories(); track c.label + (c.hint ?? ''); let i = $index) {
        <li class="mc-hbar">
          <div class="mc-hbar-head">
            <span class="mc-hbar-label">{{ c.label }}@if (c.hint) { <small> · {{ c.hint }}</small> }</span>
            <span class="mc-hbar-total" [class.text-error]="somme(c) < 0">{{ signe(somme(c)) }}</span>
          </div>
          <div class="mc-hbar-track">
            @if (diverge()) {
              <span class="mc-hbar-axis"></span>
              <span class="mc-hbar-fill" [style.animation-delay.ms]="i * 50"
                [style.left.%]="somme(c) < 0 ? 50 - (abs(somme(c)) / max()) * 50 : 50"
                [style.width.%]="(abs(somme(c)) / max()) * 50"
                [style.background]="somme(c) < 0 ? negatif() : positif()"></span>
            } @else {
              @for (v of c.values; track $index; let j = $index) {
                <span class="mc-hbar-fill mc-hbar-seg" [style.animation-delay.ms]="i * 50"
                  [style.width.%]="(abs(v) / max()) * 100" [style.background]="negatifs() ? negatif() : series()[j]?.color"
                  [attr.title]="(series()[j]?.name ?? '') + ' : ' + nombre(v)"></span>
              }
            }
          </div>
        </li>
      } @empty {
        <li class="mc-muted py-3 text-sm">Aucune donnée à afficher.</li>
      }
    </ul>
  `,
})
export class HBarChartComponent {
  readonly categories = input<ChartCategory[]>([]);
  readonly series = input<ChartSerie[]>([{ name: 'Valeur', color: MC_CHART.vert }]);
  readonly ariaLabel = input('Classement');
  readonly positif = input(MC_CHART.vert);
  readonly negatif = input(MC_CHART.rouge);

  /** Valeurs positives et négatives mélangées : barres de part et d'autre d'un axe central. */
  readonly diverge = computed(() => this.categories().some((c) => this.somme(c) < 0) && this.categories().some((c) => this.somme(c) > 0));
  /** Uniquement des valeurs négatives : barres pleine largeur, en rouge. */
  readonly negatifs = computed(() => !this.diverge() && this.categories().some((c) => this.somme(c) < 0));
  readonly max = computed(() => Math.max(1, ...this.categories().map((c) => Math.abs(this.somme(c)))));

  somme(c: ChartCategory): number {
    return c.values.reduce((s, v) => s + (v || 0), 0);
  }
  abs(v: number): number {
    return Math.abs(v);
  }
  signe(v: number): string {
    return (this.diverge() && v > 0 ? '+' : '') + formatNombre(v);
  }
  nombre(v: number): string {
    return formatNombre(v);
  }
}
