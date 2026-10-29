import * as L from 'leaflet';

/** Type représentant les différentes mesures affichables sur la carte. */
export type Mesure = 'OFFRE' | 'DEMANDE' | 'ECART';

/** Style appliqué aux territoires ne disposant d'aucune donnée (pointillés gris). */
export const STYLE_SANS_DONNEE: L.PathOptions = {
  color: '#9ca3af',
  weight: 1,
  dashArray: '3, 3',
  fillColor: '#f3f4f6',
  fillOpacity: 0.5,
};

export const ECHELLE_ECART = [
  { seuil: -100, couleur: '#991b1b', label: 'Forte pénurie' },
  { seuil: -10, couleur: '#f87171', label: 'Légère pénurie' },
  { seuil: 0, couleur: '#e5e7eb', label: 'Équilibré' },
  { seuil: 10, couleur: '#60a5fa', label: 'Légère offre excédentaire' },
  { seuil: 100, couleur: '#1e40af', label: 'Forte offre excédentaire' },
];

export const ECHELLE_NIVEAU = [
  { seuil: 0, couleur: '#eff6ff', label: 'Faible' },
  { seuil: 50, couleur: '#93c5fd', label: 'Moyen' },
  { seuil: 100, couleur: '#2563eb', label: 'Élevé' },
];

/**
 * Calcule dynamiquement la couleur d'un territoire selon la mesure active,
 * sa valeur brute et son ratio normalisé (entre 0 et 1).
 */
export function couleurMesure(measure: Mesure, value: number, ratio: number): string {
  const r = Math.max(0, Math.min(1, ratio));

  if (measure === 'ECART') {
    if (value < 0) {
      // Pénurie (négatif) : dégradé du rouge clair au rouge sombre
      return interpolerCouleur('#fee2e2', '#991b1b', r);
    } else {
      // Excédent ou équilibre (positif ou nul) : dégradé du bleu clair au bleu profond
      return interpolerCouleur('#dbeafe', '#1e40af', r);
    }
  } else if (measure === 'OFFRE') {
    // Offre : dégradé vert du clair au foncé
    return interpolerCouleur('#d1fae5', '#065f46', r);
  } else {
    // Demande : dégradé violet du clair au foncé
    return interpolerCouleur('#ede9fe', '#5b21b6', r);
  }
}

/**
 * Utilitaire interne pour interpoler fluidement entre deux couleurs hexadécimales.
 */
function interpolerCouleur(hex1: string, hex2: string, facteur: number): string {
  const c1 = parseInt(hex1.slice(1), 16);
  const c2 = parseInt(hex2.slice(1), 16);

  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;

  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;

  const r = Math.round(r1 + facteur * (r2 - r1));
  const g = Math.round(g1 + facteur * (g2 - g1));
  const b = Math.round(b1 + facteur * (b2 - b1));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}