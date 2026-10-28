import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import type { GeoJsonObject } from 'geojson';

/** Couleurs de la charte MaliCompétences (voir styles.css). */
export const MC_COLORS = {
  primary: '#1b4aa0',
  secondary: '#98630f',
  error: '#c0342a',
  info: '#2a5dbe',
  contour: '#9aa3b5',
  fond: '#f6f7f9',
  encre: '#0a1730',
};

export const MALI_CENTER: L.LatLngExpression = [17.0, -3.5];

/**
 * Carte de base : contours locaux des 19 régions + Bamako (aucun service externe),
 * avec un fond OpenStreetMap détaillé activable à la demande.
 */
export class MaliBaseMap {
  readonly map: L.Map;
  private contours?: L.GeoJSON;
  private tuiles?: L.TileLayer;

  constructor(element: HTMLElement, http: HttpClient, options: { scrollWheelZoom?: boolean; contours?: boolean; zoomFin?: boolean } = {}) {
    this.map = L.map(element, {
      scrollWheelZoom: options.scrollWheelZoom ?? false,
      zoomControl: true,
      attributionControl: true,
      // Zoom par quarts de niveau : le pays remplit tout le cadre.
      ...(options.zoomFin ? { zoomSnap: 0.25, zoomDelta: 0.5 } : {}),
    }).setView(MALI_CENTER, 5);

    if (options.contours === false) return; // contours dessinés par l'appelant (carte colorée par région)
    http.get('/geo/mali-regions.geojson').subscribe({
      next: (data) => {
        this.contours = L.geoJSON(data as GeoJsonObject, {
          interactive: false,
          style: () => ({ color: MC_COLORS.contour, weight: 1, fillColor: MC_COLORS.fond, fillOpacity: 0.55 }),
        }).addTo(this.map);
        this.contours.bringToBack();
      },
      error: () => undefined,
    });
  }

  /** Active ou désactive le fond de carte détaillé (rues, villes). */
  fondDetaille(actif: boolean): void {
    if (actif && !this.tuiles) {
      this.tuiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; contributeurs OpenStreetMap',
      }).addTo(this.map);
      this.tuiles.bringToBack();
      this.contours?.setStyle({ fillOpacity: 0.08 });
    } else if (!actif && this.tuiles) {
      this.map.removeLayer(this.tuiles);
      this.tuiles = undefined;
      this.contours?.setStyle({ fillOpacity: 0.55 });
    }
  }

  /** Recalcule la taille (utile quand la carte apparaît après un chargement). */
  invalider(): void {
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  detruire(): void {
    this.map.remove();
  }
}

/** Repère du lieu de la demande / de l'organisation : un losange (sans image externe). */
export function repereLieu(couleur = MC_COLORS.secondary): L.DivIcon {
  return L.divIcon({
    className: 'mc-repere-lieu',
    html: `<span style="display:block;width:18px;height:18px;transform:rotate(45deg);background:${couleur};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(10,23,48,.5)"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -14],
  });
}

/** Pastille de localité : un losange dont la taille suit l'effectif, le nombre est lisible au centre. */
export function pastilleLocalite(nombre: number | string, taille: number, couleur: string, opacite = 1): L.DivIcon {
  const cote = Math.round(taille * 0.74); // un losange tourné occupe √2 fois son côté
  return L.divIcon({
    className: 'mc-localite',
    html: `<span class="mc-bulle" style="width:${cote}px;height:${cote}px;background:${couleur};opacity:${opacite}"><span>${echapper(String(nombre))}</span></span>`,
    iconSize: [taille, taille],
    iconAnchor: [taille / 2, taille / 2],
  });
}

export function echapper(valeur: string | null | undefined): string {
  return (valeur ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);
}
