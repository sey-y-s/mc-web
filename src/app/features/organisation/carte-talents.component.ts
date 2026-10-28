import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import * as L from 'leaflet';
import { PageHeaderComponent } from '../../shared/components';
import { CarteTalents, GeolocalisationService, LocaliteTalents } from '../../core/services/geolocalisation.service';
import { MC_COLORS, MaliBaseMap, echapper, repereLieu } from '../../core/geo/mali-base-map';

/**
 * Carte dynamique : recensement des talents correspondant à une demande, par localité,
 * autour du lieu de la demande (ou de la position de l'organisation).
 */
@Component({
  selector: 'app-carte-talents',
  standalone: true,
  imports: [DecimalPipe, RouterLink, PageHeaderComponent],
  templateUrl: './carte-talents.component.html',
})
export class CarteTalentsComponent implements AfterViewInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly geo = inject(GeolocalisationService);

  @ViewChild('carte', { static: true }) carteRef!: ElementRef<HTMLDivElement>;

  readonly besoinId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly carteResource = rxResource({
    params: () => this.besoinId(),
    stream: ({ params }) => this.geo.carteTalents(params),
  });

  // Filtres
  readonly rayons = [0, 10, 25, 50, 100, 250, 500];
  readonly rayonKm = signal(0);
  readonly disponiblesSeulement = signal(false);
  readonly scoreMin = signal(0);
  readonly fond = signal(false);

  // Lieu de la demande
  readonly modePlacement = signal(false);
  readonly lieuBusy = signal(false);
  readonly lieuMessage = signal('');
  readonly lieuErreur = signal('');

  readonly selection = signal<string | null>(null);

  readonly data = computed<CarteTalents | undefined>(() => this.carteResource.value());
  readonly lieuConnu = computed(() => this.data()?.lieu?.latitude != null && this.data()?.lieu?.longitude != null);

  readonly localites = computed<LocaliteTalents[]>(() => {
    const d = this.data();
    if (!d) return [];
    const rayon = this.rayonKm();
    const dispo = this.disponiblesSeulement();
    const min = this.scoreMin();
    return d.localites.filter((l) => {
      if (dispo && l.nombreDisponibles === 0) return false;
      if (min > 0 && l.meilleurScore < min) return false;
      if (rayon > 0 && this.lieuConnu() && (l.distanceKm == null || l.distanceKm > rayon)) return false;
      return true;
    });
  });

  readonly totalAffiche = computed(() =>
    this.localites().reduce((s, l) => s + (this.disponiblesSeulement() ? l.nombreDisponibles : l.nombreTalents), 0),
  );
  readonly disponiblesAffiches = computed(() => this.localites().reduce((s, l) => s + l.nombreDisponibles, 0));
  readonly plusProche = computed(() => this.localites().find((l) => l.distanceKm != null) ?? null);

  private base?: MaliBaseMap;
  private calque = L.layerGroup();
  private marqueurs = new Map<string, L.Marker>();
  private premierCadrage = true;

  constructor() {
    effect(() => {
      // Redessine dès que les données ou les filtres changent.
      this.localites();
      this.data();
      this.rayonKm();
      this.dessiner();
    });
  }

  ngAfterViewInit(): void {
    this.base = new MaliBaseMap(this.carteRef.nativeElement, this.http, { scrollWheelZoom: true });
    this.calque.addTo(this.base.map);
    this.base.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.modePlacement()) this.enregistrerLieu(e.latlng.lat, e.latlng.lng);
    });
    this.dessiner();
    this.base.invalider();
  }

  basculerFond(): void {
    this.fond.update((v) => !v);
    this.base?.fondDetaille(this.fond());
  }

  changerRayon(valeur: string): void {
    this.rayonKm.set(Number(valeur) || 0);
    this.premierCadrage = true;
  }

  changerScore(valeur: string): void {
    this.scoreMin.set(Number(valeur) || 0);
  }

  actualiser(): void {
    this.premierCadrage = true;
    this.carteResource.reload();
  }

  centrerSur(l: LocaliteTalents): void {
    this.selection.set(l.cle);
    const m = this.marqueurs.get(l.cle);
    if (!this.base || !m) return;
    this.base.map.flyTo(m.getLatLng(), Math.max(this.base.map.getZoom(), 9), { duration: 0.6 });
    m.openPopup();
    this.carteRef.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  async utiliserMaPosition(): Promise<void> {
    this.lieuErreur.set('');
    this.lieuBusy.set(true);
    try {
      const p = await this.geo.positionNavigateur();
      this.enregistrerLieu(p.latitude, p.longitude);
    } catch (e) {
      this.lieuBusy.set(false);
      this.lieuErreur.set((e as Error).message);
    }
  }

  revenirOrganisation(): void {
    this.lieuBusy.set(true);
    this.lieuErreur.set('');
    this.geo.effacerLieuBesoin(this.besoinId()).subscribe({
      next: () => this.apresLieu('Le lieu de la demande suit de nouveau la position de l’organisation.'),
      error: (e) => this.erreurLieu(e),
    });
  }

  private enregistrerLieu(latitude: number, longitude: number): void {
    this.lieuBusy.set(true);
    this.lieuErreur.set('');
    this.geo.definirLieuBesoin(this.besoinId(), latitude, longitude).subscribe({
      next: () => this.apresLieu('Lieu de la demande enregistré. Les distances ont été recalculées.'),
      error: (e) => this.erreurLieu(e),
    });
  }

  private apresLieu(message: string): void {
    this.lieuBusy.set(false);
    this.modePlacement.set(false);
    this.lieuMessage.set(message);
    this.premierCadrage = true;
    this.carteResource.reload();
  }

  private erreurLieu(e: { error?: { message?: string } }): void {
    this.lieuBusy.set(false);
    this.lieuErreur.set(e?.error?.message || 'Impossible d’enregistrer le lieu de la demande.');
  }

  erreurChargement(): string {
    const err = this.carteResource.error() as { status?: number; error?: { message?: string } } | undefined;
    if (err?.status === 403) return 'Cette demande n’appartient pas à votre organisation.';
    if (err?.status === 404) return 'Demande introuvable.';
    return err?.error?.message || 'Impossible de charger la carte des talents.';
  }

  libelleSource(): string {
    const s = this.data()?.lieu?.source;
    return s === 'BESOIN' ? 'Lieu défini pour cette demande' : s === 'ORGANISATION' ? 'Position de l’organisation' : 'Aucun lieu défini';
  }

  private dessiner(): void {
    if (!this.base) return;
    this.calque.clearLayers();
    this.marqueurs.clear();
    const d = this.data();
    if (!d) return;

    const points: L.LatLng[] = [];
    if (this.lieuConnu()) {
      const ll = L.latLng(d.lieu.latitude!, d.lieu.longitude!);
      points.push(ll);
      L.marker(ll, { icon: repereLieu(MC_COLORS.secondary), zIndexOffset: 1000, title: 'Lieu de la demande', alt: 'Lieu de la demande' })
        .bindPopup(`<strong>${echapper(d.besoinTitre)}</strong><br>${echapper(this.libelleSource())}`)
        .addTo(this.calque);
      if (this.rayonKm() > 0) {
        L.circle(ll, { radius: this.rayonKm() * 1000, color: MC_COLORS.secondary, weight: 1.5, dashArray: '6 6', fillOpacity: 0.05, interactive: false }).addTo(this.calque);
      }
    }

    const max = Math.max(1, ...this.localites().map((l) => l.nombreTalents));
    for (const l of this.localites()) {
      const n = this.disponiblesSeulement() ? l.nombreDisponibles : l.nombreTalents;
      const taille = Math.round(28 + 26 * Math.sqrt(l.nombreTalents / max));
      const couleur = l.positionMesuree ? MC_COLORS.primary : MC_COLORS.info;
      const icone = L.divIcon({
        className: 'mc-localite',
        html: `<span style="display:flex;align-items:center;justify-content:center;width:${taille}px;height:${taille}px;border-radius:9999px;background:${couleur};color:#fff;font:600 13px/1 Inter,system-ui,sans-serif;border:3px solid rgba(255,255,255,.9);box-shadow:0 1px 5px rgba(0,0,0,.35);opacity:${0.65 + 0.35 * (l.meilleurScore / 100)}">${n}</span>`,
        iconSize: [taille, taille],
        iconAnchor: [taille / 2, taille / 2],
      });
      const ll = L.latLng(l.latitude, l.longitude);
      points.push(ll);
      const m = L.marker(ll, { icon: icone, title: `${l.communeNom} : ${n} talent(s)`, riseOnHover: true })
        .bindPopup(this.popup(l), { minWidth: 220 })
        .on('click', () => this.selection.set(l.cle))
        .addTo(this.calque);
      this.marqueurs.set(l.cle, m);
    }

    if (this.premierCadrage && points.length) {
      this.premierCadrage = false;
      if (points.length === 1) this.base.map.setView(points[0], 9);
      else this.base.map.fitBounds(L.latLngBounds(points), { padding: [36, 36], maxZoom: 10 });
    }
  }

  private popup(l: LocaliteTalents): HTMLElement {
    const div = document.createElement('div');
    div.innerHTML =
      `<strong style="font-size:14px">${echapper(l.communeNom)}</strong>` +
      (l.regionNom ? `<br><span style="color:#626b65">${echapper(l.regionNom)}</span>` : '') +
      `<div style="margin-top:6px;line-height:1.5">` +
      `<b>${l.nombreTalents}</b> talent(s) correspondant(s), dont <b>${l.nombreDisponibles}</b> disponible(s)<br>` +
      `Meilleur score : <b>${l.meilleurScore}%</b> · moyenne ${l.scoreMoyen}%<br>` +
      (l.distanceKm != null ? `Distance : <b>${l.distanceKm.toLocaleString('fr-FR')} km</b><br>` : '') +
      `<small style="color:#626b65">${l.positionMesuree ? 'Position moyenne partagée par les talents (arrondie)' : 'Position approximative (chef-lieu de région)'}</small></div>`;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-xs btn-primary mt-2';
    btn.textContent = 'Voir les talents correspondants';
    btn.addEventListener('click', () => this.router.navigate(['/app/organisation/matching', this.besoinId()]));
    div.appendChild(btn);
    return div;
  }

  ngOnDestroy(): void {
    this.base?.detruire();
  }
}
