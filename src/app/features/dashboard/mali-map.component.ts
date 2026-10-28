import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  inject,
  effect,
  signal,
  computed,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import type { FeatureCollection, Geometry, GeoJsonObject } from 'geojson';
import { SkillsGap } from '../../shared/models';
import type { InstitutionIndicateur } from '../../core/services/admin.service';
import { HBarChartComponent, ChartCategory } from '../../shared/components';
import { ECHELLE_ECART, ECHELLE_NIVEAU, STYLE_SANS_DONNEE, couleurMesure } from '../../core/geo/mali-palette';

interface RegionFeatureProperties {
  codeStable?: string;
  codeOfficiel?: string;
  sourcePcode?: string;
  name?: string;
  nom?: string;
  niveau?: 'REGION' | 'DISTRICT' | string;
  sourceVersion?: string;
  validOn?: string;
  areaSqKm?: number | null;
}
interface RegionFeatureCollection extends FeatureCollection<Geometry, RegionFeatureProperties> {}

const MEASURE_LABELS: Record<'OFFRE' | 'DEMANDE' | 'ECART', string> = {
  OFFRE: 'Offre disponible',
  DEMANDE: 'Demande estimée',
  ECART: 'Écart (offre − demande)',
};

@Component({
  selector: 'app-mali-map',
  standalone: true,
  imports: [HBarChartComponent],
  templateUrl: './mali-map.component.html',
})
export class MaliMapComponent implements AfterViewInit, OnDestroy {
  /** Maintenu pour compatibilité avec les écrans qui consomment encore le modèle SkillsGap historique. */
  readonly items = input<SkillsGap[]>([]);
  /** Indicateurs institutionnels déjà agrégés et protégés par le backend. */
  readonly institutionItems = input<InstitutionIndicateur[]>([]);
  readonly mesure = input<'OFFRE' | 'DEMANDE' | 'ECART'>('ECART');

  readonly echelleEcart = ECHELLE_ECART;
  readonly echelleNiveau = ECHELLE_NIVEAU;

  @ViewChild('map', { static: true }) mapElement!: ElementRef<HTMLDivElement>;
  
  private readonly http = inject(HttpClient);
  private map?: L.Map;
  private geoLayer?: L.GeoJSON;
  
  // Utilisation d'un signal pour la collection GeoJSON (100% réactif)
  private readonly collection = signal<RegionFeatureCollection | undefined>(undefined);

  status = 'Chargement des limites territoriales locales…';
  readonly regions = signal<RegionFeatureProperties[]>([]);
  sortAscending = true;
  /** Par défaut, seuls les territoires qui ont des données sont listés (lecture plus simple). */
  readonly afficherTout = signal(false);
  readonly libelleMesure = computed(() => MEASURE_LABELS[this.mesure()]);
  // readonly echelleEcart = ECHELLE_ECART;
  // readonly echelleNiveau = ECHELLE_NIVEAU;

  /** Indicateurs du tableau de bord (format SkillsGap) cumulés par territoire, faute d'agrégats institutionnels. */
  private readonly cumulsParTerritoire = computed(() => {
    const m = new Map<string, { offre: number; demande: number; ecart: number; competences: number }>();
    for (const it of this.items()) {
      const k = this.normaliser(it.regionNom ?? '');
      if (!k) continue;
      const c = m.get(k) ?? { offre: 0, demande: 0, ecart: 0, competences: 0 };
      c.offre += it.offreDisponible ?? 0;
      c.demande += it.demandeEstimee ?? 0;
      c.ecart += it.ecart ?? 0;
      c.competences += 1;
      m.set(k, c);
    }
    return m;
  });

  readonly aDesDonnees = computed(() => this.institutionItems().length > 0 || this.cumulsParTerritoire().size > 0);

  readonly regionsAffichees = computed(() => {
    this.institutionItems(); this.cumulsParTerritoire(); this.mesure();
    const toutes = this.regions();
    return this.afficherTout() ? toutes : toutes.filter((r) => this.detailFor(r).value !== null);
  });

  readonly nombreSansDonnee = computed(() => {
    this.institutionItems(); this.cumulsParTerritoire(); this.mesure();
    return this.regions().filter((r) => this.detailFor(r).value === null).length;
  });

  private normaliser(v: string): string {
    return v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/^(district de |region de )/, '').trim();
  }

  constructor() {
    // L'effect réagit maintenant à tous les signaux (collection, institutionItems, mesure)
    effect(() => {
      const col = this.collection();
      const currentMap = this.map;
      
      // Lecture des signaux pour enregistrer les dépendances réactives
      this.institutionItems();
      this.items();
      this.mesure();

      if (col && currentMap) {
        // Détermine si on doit fitter les bounds au premier chargement
        const isInitialRender = !this.geoLayer;
        this.renderLayer(isInitialRender);
      }
    });
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapElement.nativeElement, {
      scrollWheelZoom: false,
      zoomControl: true,
      preferCanvas: true,
      renderer: L.canvas(),
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      attributionControl: false,
    }).setView([17.0, -3.5], 5);
    setTimeout(() => this.map?.invalidateSize(), 0);

    // Chargement du GeoJSON local depuis le dossier public
    this.http.get<RegionFeatureCollection>('/geo/mali-regions.geojson').subscribe({
      next: (data) => {
        const validation = this.validateCollection(data);
        if (validation) {
          this.status = validation;
          return;
        }
        
        const sortedRegions = data.features
          .map((feature) => ({ ...(feature.properties ?? {}) }))
          .sort((a, b) => this.label(a).localeCompare(this.label(b), 'fr'));
        
        // Mise à jour des signaux (déclenche instantanément le rendu UI)
        this.regions.set(sortedRegions);
        this.collection.set(data);
        
        this.status = 'Carte des 19 régions et du district de Bamako. Cliquez sur un territoire pour le détail.';
      },
      error: () => {
        this.status = 'Carte indisponible : impossible de charger le GeoJSON local.';
      },
    });
  }

  private validateCollection(collection: RegionFeatureCollection | null | undefined): string | null {
    if (!collection || collection.type !== 'FeatureCollection' || !Array.isArray(collection.features)) {
      return 'Carte bloquée : le fichier local n’est pas une GeoJSON FeatureCollection valide.';
    }
    if (collection.features.length !== 20) {
      return `Carte bloquée : 20 territoires attendus (19 régions + Bamako), ${collection.features.length} reçus.`;
    }
    const codes = collection.features.map((feature) => feature.properties?.codeStable ?? '');
    if (codes.some((code) => !code.trim()) || new Set(codes).size !== 20) {
      return 'Carte bloquée : codes stables absents ou non uniques dans le GeoJSON.';
    }
    const regionCount = collection.features.filter((feature) => feature.properties?.niveau === 'REGION').length;
    const districtCount = collection.features.filter((feature) => feature.properties?.niveau === 'DISTRICT').length;
    if (regionCount !== 19 || districtCount !== 1) {
      return `Carte bloquée : 19 régions et 1 district attendus; détectés ${regionCount} régions et ${districtCount} districts.`;
    }
    if (collection.features.some((feature) => !feature.geometry || !['Polygon', 'MultiPolygon'].includes(feature.geometry.type))) {
      return 'Carte bloquée : une ou une plusieurs entités ne possèdent pas de géométrie polygonale.';
    }
    return null;
  }

  private renderLayer(fitBounds: boolean): void {
    const col = this.collection();
    if (!this.map || !col) return;
    if (this.geoLayer) this.map.removeLayer(this.geoLayer);

    this.geoLayer = L.geoJSON(col as GeoJsonObject, {
      renderer: L.canvas(),
      style: (feature) => this.styleFor((feature?.properties ?? {}) as RegionFeatureProperties),
      onEachFeature: (feature, layer) => {
        const properties = (feature.properties ?? {}) as RegionFeatureProperties;
        const label = this.label(properties);
        const detail = this.detailFor(properties);
        layer.bindTooltip(
          `<span class="mc-tip-titre">${this.escapeHtml(label)}</span>` +
            `<span class="mc-tip-ligne">${this.escapeHtml(MEASURE_LABELS[this.mesure()])} : <b>${this.escapeHtml(detail.valueLabel)}</b></span>` +
            `<span class="mc-tip-ligne">${this.escapeHtml(detail.explanation)}</span>`,
          { sticky: true, className: 'mc-tip', direction: 'top', offset: [0, -8] },
        );
        layer.on({
          mouseover: (e) => { const p = e.target as L.Path; p.setStyle({ weight: 2.5, color: '#0a1730' }); p.bringToFront(); },
          mouseout: (e) => this.geoLayer?.resetStyle(e.target as L.Path),
        });
        layer.bindPopup(
          `<strong>${this.escapeHtml(label)}</strong><br>` +
          `Code stable : <code>${this.escapeHtml(properties.codeStable ?? '—')}</code><br>` +
          `Niveau : ${this.escapeHtml(properties.niveau ?? '—')}<br>` +
          `${this.escapeHtml(MEASURE_LABELS[this.mesure()])} : ${this.escapeHtml(detail.valueLabel)}<br>` +
          `<small>${this.escapeHtml(detail.explanation)}</small>`,
        );
      },
    } as L.GeoJSONOptions & { renderer?: any }).addTo(this.map);

    if (fitBounds && this.geoLayer.getLayers().length) {
      this.map.invalidateSize();
      this.map.fitBounds(this.geoLayer.getBounds(), { padding: [10, 10] });
    }
  }

  private styleFor(properties: RegionFeatureProperties): L.PathOptions {
    const detail = this.detailFor(properties);
    if (detail.value === null) return { ...STYLE_SANS_DONNEE }; // pointillés : jamais compté comme zéro
    return { color: '#ffffff', weight: 1.4, opacity: 1, fillColor: this.colorFor(detail.value), fillOpacity: 1 };
  }

  private detailFor(properties: RegionFeatureProperties): { value: number | null; valueLabel: string; explanation: string } {
    const code = properties.codeStable ?? '';
    const row = this.institutionItems().find((item) => item.regionCode === code);
    if (!row && !this.institutionItems().length) {
      const cumul = this.cumulsParTerritoire().get(this.normaliser(this.label(properties)));
      if (!cumul) return { value: null, valueLabel: 'Pas encore de données', explanation: 'Aucun besoin ni talent validé recensé ici pour le moment.' };
      const m = this.mesure();
      const v = m === 'OFFRE' ? cumul.offre : m === 'DEMANDE' ? cumul.demande : cumul.ecart;
      return {
        value: v,
        valueLabel: new Intl.NumberFormat('fr-FR').format(v),
        explanation: m === 'ECART'
          ? (v < 0 ? `Il manque des talents (cumul de ${cumul.competences} compétence(s)).` : `Offre suffisante (cumul de ${cumul.competences} compétence(s)).`)
          : `Cumul de ${cumul.competences} compétence(s).`,
      };
    }
    if (!row) {
      return { value: null, valueLabel: 'Non disponible', explanation: 'Aucune donnée publiée pour ce territoire et cette sélection.' };
    }
    const currentMeasure = this.mesure();
    const value = currentMeasure === 'OFFRE' ? row.offre : currentMeasure === 'DEMANDE' ? row.demande : row.ecart;
    const privacy = (row.statutConfidentialite ?? '').toLocaleLowerCase('fr');
    const protectedCell = privacy.includes('masqu') || privacy.includes('supprim') || privacy.includes('confident') || privacy.includes('non_autoris');
    if (value === null || value === undefined || protectedCell) {
      return { value: null, valueLabel: 'Masqué / indisponible', explanation: row.motifMasquage || 'Valeur masquée ou indisponible selon les règles de confidentialité.' };
    }
    return {
      value,
      valueLabel: new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(value),
      explanation: `Confidentialité : ${row.statutConfidentialite || 'statut non précisé'}.`,
    };
  }

  private colorFor(value: number): string {
    const currentMeasure = this.mesure();
    const sources = this.institutionItems().length
      ? this.institutionItems().map((item) => currentMeasure === 'OFFRE' ? item.offre : currentMeasure === 'DEMANDE' ? item.demande : item.ecart)
      : [...this.cumulsParTerritoire().values()].map((c) => currentMeasure === 'OFFRE' ? c.offre : currentMeasure === 'DEMANDE' ? c.demande : c.ecart);
    const values = sources
      .filter((candidate): candidate is number => candidate !== null && candidate !== undefined && Number.isFinite(candidate));
    const max = Math.max(1, ...values.map((candidate) => Math.abs(candidate)));
    const ratio = Math.abs(value) / max;
    return couleurMesure(currentMeasure, value, ratio);
  }

  /** Classement des territoires ayant une valeur (barres, négatif = pénurie). */
  readonly classement = computed<ChartCategory[]>(() => {
    this.institutionItems(); this.cumulsParTerritoire(); this.mesure();
    return this.regions()
      .map((r) => ({ label: this.label(r), v: this.detailFor(r).value }))
      .filter((x): x is { label: string; v: number } => x.v !== null)
      .sort((a, b) => (this.mesure() === 'ECART' ? a.v - b.v : b.v - a.v))
      .slice(0, 10)
      .map((x) => ({ label: x.label, values: [x.v] }));
  });

  valeur(properties: RegionFeatureProperties): string {
    return this.detailFor(properties).valueLabel;
  }

  explication(properties: RegionFeatureProperties = {} as any): string {
    return this.detailFor(properties).explanation;
  }

  private label(properties: RegionFeatureProperties): string {
    return properties.name ?? properties.nom ?? 'Territoire sans nom';
  }

  sortRegions(): void {
    this.sortAscending = !this.sortAscending;
    this.regions.update((currentRegions) =>
      [...currentRegions].sort((a, b) => 
        this.sortAscending
          ? this.label(a).localeCompare(this.label(b), 'fr')
          : this.label(b).localeCompare(this.label(a), 'fr')
      )
    );
  }

  private escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? char);
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }
}