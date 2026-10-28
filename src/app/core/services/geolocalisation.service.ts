import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Position {
  latitude: number | null;
  longitude: number | null;
  datePosition?: string | null;
  definie: boolean;
}

export interface LieuDemande {
  latitude: number | null;
  longitude: number | null;
  /** BESOIN : lieu propre à la demande ; ORGANISATION : position de l'organisation ; AUCUN. */
  source: 'BESOIN' | 'ORGANISATION' | 'AUCUN';
}

export interface LocaliteTalents {
  cle: string;
  communeId: string | null;
  communeNom: string;
  regionId: string | null;
  regionNom: string | null;
  latitude: number;
  longitude: number;
  positionMesuree: boolean;
  nombreTalents: number;
  nombreDisponibles: number;
  meilleurScore: number;
  scoreMoyen: number;
  distanceKm: number | null;
  talentIds: string[];
}

export interface CarteTalents {
  besoinId: string;
  besoinTitre: string;
  lieu: LieuDemande;
  totalTalents: number;
  talentsSansLocalite: number;
  localites: LocaliteTalents[];
}

/** Carte du Mali : tous les talents regroupés par localité (chiffres agrégés, profils anonymisés). */
export interface LocaliteMali {
  cle: string;
  communeId: string | null;
  communeNom: string;
  regionId: string | null;
  regionNom: string | null;
  latitude: number;
  longitude: number;
  positionMesuree: boolean;
  nombreTalents: number;
  nombreDisponibles: number;
  nombreValides: number;
  principalesCompetences: string[];
  principauxMetiers: string[];
}

export interface RegionTalents {
  regionId: string;
  regionNom: string;
  codeStable: string | null;
  nombreTalents: number;
  nombreDisponibles: number;
}

export interface CarteMali {
  totalTalents: number;
  totalDisponibles: number;
  totalValides: number;
  talentsSansLocalite: number;
  regions: RegionTalents[];
  localites: LocaliteMali[];
}

export interface FiltresCarteMali {
  competenceId?: string;
  regionId?: string;
  disponibilite?: string;
}

/** Géolocalisation des organisations, lieu des demandes et recensement des talents par localité. */
@Injectable({ providedIn: 'root' })
export class GeolocalisationService {
  private readonly api = inject(ApiService);

  maPositionOrganisation(): Observable<Position> {
    return this.api.get<Position>('/api/v1/organisations/me/position');
  }

  definirPositionOrganisation(latitude: number, longitude: number): Observable<Position> {
    return this.api.put<Position>('/api/v1/organisations/me/position', { latitude, longitude });
  }

  effacerPositionOrganisation(): Observable<void> {
    return this.api.delete<void>('/api/v1/organisations/me/position');
  }

  /** Tous les talents du Mali par localité, avec filtres facultatifs. */
  carteMali(filtres: FiltresCarteMali = {}): Observable<CarteMali> {
    const params: Record<string, string> = {};
    if (filtres.competenceId) params['competenceId'] = filtres.competenceId;
    if (filtres.regionId) params['regionId'] = filtres.regionId;
    if (filtres.disponibilite) params['disponibilite'] = filtres.disponibilite;
    return this.api.get<CarteMali>('/api/v1/talents/carte', { params });
  }

  carteTalents(besoinId: string): Observable<CarteTalents> {
    return this.api.get<CarteTalents>(`/api/v1/besoins/${besoinId}/carte-talents`);
  }

  definirLieuBesoin(besoinId: string, latitude: number, longitude: number): Observable<LieuDemande> {
    return this.api.put<LieuDemande>(`/api/v1/besoins/${besoinId}/position`, { latitude, longitude });
  }

  effacerLieuBesoin(besoinId: string): Observable<LieuDemande> {
    return this.api.delete<LieuDemande>(`/api/v1/besoins/${besoinId}/position`);
  }

  /** Position GPS du navigateur (l'utilisateur doit l'autoriser). */
  positionNavigateur(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        reject(new Error('La géolocalisation n’est pas disponible sur cet appareil.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        (e) =>
          reject(
            new Error(
              e.code === e.PERMISSION_DENIED
                ? 'Accès à la position refusé. Autorisez la localisation dans le navigateur ou cliquez sur la carte.'
                : 'Position introuvable pour le moment. Réessayez ou cliquez sur la carte.',
            ),
          ),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
      );
    });
  }
}
