import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import * as L from 'leaflet';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/auth/user-role.enum';
import { CarteMali, GeolocalisationService, LocaliteMali, RegionTalents } from '../../core/services/geolocalisation.service';
import { MC_COLORS, MaliBaseMap, echapper } from '../../core/geo/mali-base-map';
import { DonutChartComponent, HBarChartComponent, ChartCategory, ChartSegment, MC_CHART } from '../../shared/components';

interface Option { id: string; nom: string; }
type RegionFeature = Feature<Geometry, { codeStable?: string; nom?: string; name?: string }>;

/** Délai d'actualisation automatique de la carte (données en direct du serveur). */
const ACTUALISATION_MS = 60_000;

/** Emprise du Mali (sud-ouest, nord-est). */
const MALI_BOUNDS = L.latLngBounds([10.1, -12.3], [25.1, 4.3]);

/** Dégradé de la charte (du plus clair au plus foncé) pour colorer les régions. */
const PALETTE = ['#c4e0cd', '#8fc3a4', '#55a07b', '#2b7854', '#15553b'];
const SANS_TALENT = '#f2f3ef';

/**
 * Carte dynamique du Mali : tous les talents recensés par localité.
 * - régions colorées selon le nombre de talents ;
 * - une pastille par commune (taille = nombre de talents), détail au clic ;
 * - filtres compétence / région / disponibilité, actualisation automatique.
 * `compact` : version réduite intégrée aux tableaux de bord.
 */
@Component({
  selector: 'mc-carte-mali-talents',
  standalone: true,
  imports: [DatePipe, RouterLink, DonutChartComponent, HBarChartComponent],
  templateUrl: './carte-mali-talents.component.html',
})
export class CarteMaliTalentsComponent implements AfterViewInit, OnDestroy {
  @Input() compact = false;

  private readonly http = inject(HttpClient);
  private readonly api = inject(ApiService);
  private readonly geo = inject(GeolocalisationService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @ViewChild('carte', { static: true }) carteRef!: ElementRef<HTMLDivElement>;

  readonly estOrganisation = this.auth.hasRole([UserRole.ORGANISATION]);

  // Filtres
  readonly competenceId = signal('');
  readonly regionId = signal('');
  readonly disponiblesSeulement = signal(false);
  readonly fond = signal(false);
  readonly autoActualisation = signal(true);
  readonly selection = signal<string | null>(null);
  readonly derniereMiseAJour = signal<Date | null>(null);

  readonly competencesResource = rxResource({
    stream: () => this.api.get<Option[]>('/api/v1/competences').pipe(catchError(() => of([] as Option[]))),
    defaultValue: [] as Option[],
  });
  readonly regionsResource = rxResource({
    stream: () => this.api.get<Option[]>('/api/v1/regions').pipe(catchError(() => of([] as Option[]))),
    defaultValue: [] as Option[],
  });

  readonly carteResource = rxResource({
    params: () => ({
      competenceId: this.competenceId(),
      regionId: this.regionId(),
      disponibilite: this.disponiblesSeulement() ? 'DISPONIBLE' : '',
    }),
    stream: ({ params }) => this.geo.carteMali(params),
  });

  readonly data = computed<CarteMali | undefined>(() => this.carteResource.value());
  readonly localites = computed<LocaliteMali[]>(() => this.data()?.localites ?? []);
  readonly nombreLocalites = computed(() => this.localites().length);
  readonly regionEnTete = computed<RegionTalents | null>(() => this.data()?.regions?.[0] ?? null);
  readonly filtresActifs = computed(() => !!(this.competenceId() || this.regionId() || this.disponiblesSeulement()));

  readonly C = MC_CHART;
  readonly palette = PALETTE;
  readonly sansTalent = SANS_TALENT;
  readonly seriesRegions = [
    { name: 'Disponibles', color: MC_CHART.or },
    { name: 'Non disponibles', color: MC_CHART.vert },
  ];

  /** Seuils des 5 classes de couleur (nombre de talents par région). */
  readonly paliers = computed(() => {
    const max = Math.max(0, ...(this.data()?.regions ?? []).map((r) => r.nombreTalents));
    if (max <= 0) return [] as { min: number; max: number; couleur: string }[];
    const bornes = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => Math.round(t * max));
    const out: { min: number; max: number; couleur: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const min = i === 0 ? 1 : bornes[i] + 1;
      const hi = bornes[i + 1];
      if (hi >= min) out.push({ min, max: hi, couleur: PALETTE[i] });
    }
    return out;
  });

  /** Anneau : talents disponibles ou non. */
  readonly segmentsDisponibilite = computed<ChartSegment[]>(() => {
    const d = this.data();
    const total = d?.totalTalents ?? 0;
    const dispo = d?.totalDisponibles ?? 0;
    return [
      { label: 'Disponibles', value: dispo, color: MC_CHART.or },
      { label: 'Non disponibles', value: Math.max(0, total - dispo), color: MC_CHART.vert },
    ];
  });

  /** Classement des régions (disponibles + non disponibles). */
  readonly categoriesRegions = computed<ChartCategory[]>(() =>
    [...(this.data()?.regions ?? [])]
      .filter((r) => r.nombreTalents > 0)
      .sort((a, b) => b.nombreTalents - a.nombreTalents)
      .slice(0, 8)
      .map((r) => ({ label: r.regionNom, values: [r.nombreDisponibles, Math.max(0, r.nombreTalents - r.nombreDisponibles)] })),
  );

  /** Part des talents ayant au moins une compétence validée. */
  readonly partValides = computed(() => {
    const d = this.data();
    return d?.totalTalents ? Math.round((d.totalValides / d.totalTalents) * 100) : null;
  });

  private base?: MaliBaseMap;
  private regionsCouche?: L.GeoJSON;
  private geojson?: FeatureCollection<Geometry, RegionFeature['properties']>;
  private readonly calque = L.layerGroup();
  private readonly marqueurs = new Map<string, L.Marker>();
  private cadrer = true;
  private minuterie?: ReturnType<typeof setInterval>;

  constructor() {
    effect(() => {
      // Redessine à chaque nouvelle réponse du serveur.
      const d = this.data();
      if (d) this.derniereMiseAJour.set(new Date());
      this.dessiner();
    });
  }

  ngAfterViewInit(): void {
    this.base = new MaliBaseMap(this.carteRef.nativeElement, this.http, { scrollWheelZoom: !this.compact, contours: false, zoomFin: true });
    this.calque.addTo(this.base.map);
    this.http.get<FeatureCollection<Geometry, RegionFeature['properties']>>('/geo/mali-regions.geojson').subscribe({
      next: (g) => {
        this.geojson = g;
        this.dessiner();
      },
      error: () => undefined,
    });
    this.base.invalider();
    this.minuterie = setInterval(() => {
      if (this.autoActualisation() && !this.carteResource.isLoading()) this.carteResource.reload();
    }, ACTUALISATION_MS);
  }

  // ----- Actions -----

  changerCompetence(id: string): void { this.cadrer = true; this.competenceId.set(id); }
  changerRegion(id: string): void { this.cadrer = true; this.regionId.set(id); }
  basculerDisponibles(): void { this.cadrer = true; this.disponiblesSeulement.update((v) => !v); }
  basculerAuto(): void { this.autoActualisation.update((v) => !v); }

  basculerFond(): void {
    this.fond.update((v) => !v);
    this.base?.fondDetaille(this.fond());
    this.regionsCouche?.setStyle((f) => this.styleRegion(f as RegionFeature));
  }

  reinitialiser(): void {
    this.cadrer = true;
    this.competenceId.set('');
    this.regionId.set('');
    this.disponiblesSeulement.set(false);
  }

  actualiser(): void {
    this.carteResource.reload();
  }

  centrerSur(l: LocaliteMali): void {
    this.selection.set(l.cle);
    const m = this.marqueurs.get(l.cle);
    if (!this.base || !m) return;
    this.base.map.flyTo(m.getLatLng(), Math.max(this.base.map.getZoom(), 9), { duration: 0.6 });
    m.openPopup();
  }

  voirTalents(l: LocaliteMali): void {
    const queryParams: Record<string, string> = {};
    if (l.regionId) queryParams['regionId'] = l.regionId;
    if (l.communeId) queryParams['communeId'] = l.communeId;
    if (this.disponiblesSeulement()) queryParams['disponibilite'] = 'DISPONIBLE';
    this.router.navigate(['/app/organisation/talents'], { queryParams });
  }

  erreur(): string {
    const err = this.carteResource.error() as { status?: number; error?: { message?: string } } | undefined;
    if (err?.status === 403) return 'Votre compte n’a pas accès à la carte des talents.';
    return err?.error?.message || 'Impossible de charger la carte des talents. Vérifiez que le serveur est démarré.';
  }

  // ----- Dessin -----

  private totalRegion(code: string | undefined, nom: string | undefined): RegionTalents | undefined {
    const regions = this.data()?.regions ?? [];
    return regions.find((r) => (code && r.codeStable === code) || (nom && r.regionNom?.toLowerCase() === nom.toLowerCase()));
  }

  private styleRegion(f: RegionFeature): L.PathOptions {
    const p = f.properties ?? {};
    const total = this.totalRegion(p.codeStable, p.nom ?? p.name)?.nombreTalents ?? 0;
    const palier = this.paliers().find((x) => total >= x.min && total <= x.max);
    return {
      color: '#ffffff',
      weight: 1.4,
      opacity: 1,
      fillColor: total === 0 || !palier ? SANS_TALENT : palier.couleur,
      fillOpacity: this.fond() ? 0.45 : 1,
    };
  }

  private dessinerRegions(): void {
    if (!this.base || !this.geojson) return;
    this.regionsCouche?.remove();
    this.regionsCouche = L.geoJSON(this.geojson, {
      style: (f) => this.styleRegion(f as RegionFeature),
      onEachFeature: (f, layer) => {
        const p = (f as RegionFeature).properties ?? {};
        const nom = p.nom ?? p.name ?? 'Région';
        const r = this.totalRegion(p.codeStable, nom);
        layer.bindTooltip(
          `<span class="mc-tip-titre">${echapper(nom)}</span>` +
            `<span class="mc-tip-ligne"><b>${r?.nombreTalents ?? 0}</b> talent(s)</span>` +
            (r ? `<span class="mc-tip-ligne"><b>${r.nombreDisponibles}</b> disponible(s)</span>` : '<span class="mc-tip-ligne">Aucun talent recensé</span>'),
          { sticky: true, className: 'mc-tip', direction: 'top', offset: [0, -8] },
        );
        layer.on({
          mouseover: (e) => {
            const path = e.target as L.Path;
            path.setStyle({ weight: 3, color: MC_COLORS.secondary });
            path.bringToFront();
          },
          mouseout: (e) => this.regionsCouche?.resetStyle(e.target as L.Path),
          click: () => {
            if (this.compact) return;
            const region = this.regionsResource.value().find((x) => x.nom.toLowerCase() === nom.toLowerCase()) ?? (r ? { id: r.regionId } : null);
            if (region) this.changerRegion(this.regionId() === region.id ? '' : region.id);
          },
        });
      },
    }).addTo(this.base.map);
    this.regionsCouche.bringToBack();
  }

  private dessiner(): void {
    if (!this.base) return;
    this.dessinerRegions();
    this.calque.clearLayers();
    this.marqueurs.clear();
    const localites = this.localites();
    if (!localites.length) {
      if (this.cadrer) this.base.map.fitBounds(MALI_BOUNDS, { padding: [12, 12] });
      return;
    }
    const max = Math.max(1, ...localites.map((l) => l.nombreTalents));
    const points: L.LatLng[] = [];
    for (const l of localites) {
      const taille = Math.round(24 + 26 * Math.sqrt(l.nombreTalents / max));
      const couleur = l.nombreDisponibles > 0 ? MC_CHART.orFonce : MC_COLORS.info;
      const icone = L.divIcon({
        className: 'mc-localite',
        html: `<span class="mc-bulle" style="width:${taille}px;height:${taille}px;background:${couleur}">${l.nombreTalents}</span>`,
        iconSize: [taille, taille],
        iconAnchor: [taille / 2, taille / 2],
      });
      const ll = L.latLng(l.latitude, l.longitude);
      points.push(ll);
      const m = L.marker(ll, { icon: icone, title: `${l.communeNom} : ${l.nombreTalents} talent(s)`, alt: `${l.communeNom} : ${l.nombreTalents} talent(s)`, riseOnHover: true })
        .bindPopup(this.popup(l), { minWidth: 230 })
        .on('click', () => this.selection.set(l.cle))
        .addTo(this.calque);
      this.marqueurs.set(l.cle, m);
    }
    if (this.cadrer) {
      this.cadrer = false;
      if (!this.regionId()) {
        // Vue nationale : tout le Mali reste visible.
        this.base.map.fitBounds(MALI_BOUNDS, { padding: [8, 8] });
      } else if (points.length === 1) {
        this.base.map.setView(points[0], 8);
      } else {
        this.base.map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 9 });
      }
    }
  }

  private popup(l: LocaliteMali): HTMLElement {
    const div = document.createElement('div');
    const liste = (titre: string, valeurs: string[]) =>
      valeurs.length ? `<div style="margin-top:4px"><span style="color:#626b65">${titre} :</span> ${valeurs.map(echapper).join(', ')}</div>` : '';
    div.innerHTML =
      `<strong style="font-size:14px">${echapper(l.communeNom)}</strong>` +
      (l.regionNom ? `<br><span style="color:#626b65">Région de ${echapper(l.regionNom)}</span>` : '') +
      `<div style="margin-top:6px;line-height:1.5"><b>${l.nombreTalents}</b> talent(s) recensé(s)<br>` +
      `<b>${l.nombreDisponibles}</b> disponible(s) · <b>${l.nombreValides}</b> avec compétence validée</div>` +
      liste('Compétences', l.principalesCompetences) +
      liste('Métiers', l.principauxMetiers) +
      `<div style="margin-top:4px"><small style="color:#626b65">${l.positionMesuree ? 'Position moyenne partagée par les talents (arrondie)' : 'Position approximative de la commune'}</small></div>`;
    if (this.estOrganisation) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-xs btn-primary mt-2';
      btn.textContent = 'Voir ces talents';
      btn.addEventListener('click', () => this.voirTalents(l));
      div.appendChild(btn);
    }
    return div;
  }

  ngOnDestroy(): void {
    if (this.minuterie) clearInterval(this.minuterie);
    this.base?.detruire();
  }
}
