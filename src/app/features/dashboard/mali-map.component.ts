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
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import type { FeatureCollection, Geometry, GeoJsonObject } from 'geojson';
import { SkillsGap } from '../../shared/models';
import type { InstitutionIndicateur } from '../../core/services/admin.service';

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
  ECART: 'Écart (demande − offre)',
};

@Component({
  selector: 'app-mali-map',
  standalone: true,
  templateUrl: './mali-map.component.html',
})
export class MaliMapComponent implements AfterViewInit, OnDestroy {
  /** Maintenu pour compatibilité avec les écrans qui consomment encore le modèle SkillsGap historique. */
  readonly items = input<SkillsGap[]>([]);
  /** Indicateurs institutionnels déjà agrégés et protégés par le backend. */
  readonly institutionItems = input<InstitutionIndicateur[]>([]);
  readonly mesure = input<'OFFRE' | 'DEMANDE' | 'ECART'>('ECART');

  @ViewChild('map', { static: true }) mapElement!: ElementRef<HTMLDivElement>;
  
  private readonly http = inject(HttpClient);
  private map?: L.Map;
  private geoLayer?: L.GeoJSON;
  
  // Utilisation d'un signal pour la collection GeoJSON (100% réactif)
  private readonly collection = signal<RegionFeatureCollection | undefined>(undefined);

  status = 'Chargement des limites territoriales locales…';
  readonly regions = signal<RegionFeatureProperties[]>([]);
  sortAscending = true;

  constructor() {
    // L'effect réagit maintenant à tous les signaux (collection, institutionItems, mesure)
    effect(() => {
      const col = this.collection();
      const currentMap = this.map;
      
      // Lecture des signaux pour enregistrer les dépendances réactives
      this.institutionItems();
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
    }).setView([17.0, -3.5], 5);

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
        
        this.status = '20 territoires chargés...';
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
        layer.bindTooltip(`${this.escapeHtml(label)} — ${this.escapeHtml(detail.valueLabel)}`, { sticky: true });
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
      this.map.fitBounds(this.geoLayer.getBounds(), { padding: [12, 12] });
    }
  }

  private styleFor(properties: RegionFeatureProperties): L.PathOptions {
    const detail = this.detailFor(properties);
    return {
      color: '#475569',
      weight: 1,
      fillColor: detail.value === null ? '#cbd5e1' : this.colorFor(detail.value),
      fillOpacity: 0.86,
    };
  }

  private detailFor(properties: RegionFeatureProperties): { value: number | null; valueLabel: string; explanation: string } {
    const code = properties.codeStable ?? '';
    const row = this.institutionItems().find((item) => item.regionCode === code);
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
    const values = this.institutionItems()
      .map((item) => currentMeasure === 'OFFRE' ? item.offre : currentMeasure === 'DEMANDE' ? item.demande : item.ecart)
      .filter((candidate): candidate is number => candidate !== null && candidate !== undefined && Number.isFinite(candidate));
    const max = Math.max(1, ...values.map((candidate) => Math.abs(candidate)));
    const ratio = Math.abs(value) / max;
    if (currentMeasure === 'ECART') {
      if (value > 0) return ratio >= 0.66 ? '#b91c1c' : ratio >= 0.33 ? '#ef4444' : '#fecaca';
      if (value < 0) return ratio >= 0.66 ? '#166534' : ratio >= 0.33 ? '#4ade80' : '#bbf7d0';
      return '#e2e8f0';
    }
    return ratio >= 0.66 ? '#166534' : ratio >= 0.33 ? '#4ade80' : '#bbf7d0';
  }

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