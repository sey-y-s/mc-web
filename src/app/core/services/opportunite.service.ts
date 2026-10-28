import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Opportunite } from '../../shared/models';

export type StatutOpportunite = 'BROUILLON' | 'PUBLIEE' | 'EXPIREE' | 'ARCHIVEE';
export type TypeOpportunite =
  | 'FORMATION_GRATUITE' | 'BOURSE' | 'PROGRAMME' | 'APPEL_CANDIDATURE'
  | 'CONCOURS' | 'INSERTION' | 'ACCOMPAGNEMENT' | 'AUTRE';

export interface OpportuniteRequest {
  categorieId: string;
  titre: string;
  description: string;
  statut: StatutOpportunite;
  type: TypeOpportunite;
  dateExpiration?: string; // AAAA-MM-JJ
  regionId?: string | null;
  communeId?: string | null;
}

export type StatutCandidature = 'ENVOYEE' | 'RETENUE' | 'NON_RETENUE';

export interface Candidature {
  id: string;
  opportuniteId: string;
  opportuniteTitre: string;
  citoyenId: string;
  citoyenNom: string;
  telephone?: string | null;
  communeNom?: string | null;
  regionNom?: string | null;
  locale: boolean;
  nombreCompetences: number;
  nombreCompetencesValidees: number;
  message?: string | null;
  statut: StatutCandidature;
  dateCandidature: string;
}

export interface OpportuniteDetail extends Opportunite {
  categorieId?: string;
}

@Injectable({ providedIn: 'root' })
export class OpportuniteService {
  private readonly api = inject(ApiService);

  // Public : uniquement les opportunités publiées et non expirées. 
  listerPubliees() {
    return this.api.get<OpportuniteDetail[]>('/api/v1/opportunites');
  }

  // Super admin : toutes les opportunités, tous statuts. 
  listerPourGestion() {
    return this.api.get<OpportuniteDetail[]>('/api/v1/opportunites/gestion');
  }

  // Admin (lecture seule). 
  listerPourAdmin() {
    return this.api.get<OpportuniteDetail[]>('/api/v1/admin/opportunites');
  }

  creer(body: OpportuniteRequest) {
    return this.api.post<OpportuniteDetail>('/api/v1/opportunites', body);
  }

  modifier(id: string, body: OpportuniteRequest) {
    return this.api.put<OpportuniteDetail>(`/api/v1/opportunites/${id}`, body);
  }

  // Publier ou archiver = un PUT complet avec le nouveau statut. 
  changerStatut(item: OpportuniteDetail, statut: StatutOpportunite) {
    return this.modifier(item.id, {
      categorieId: item.categorieId ?? '',
      titre: item.titre,
      description: item.description ?? '',
      statut,
      type: item.type as TypeOpportunite,
      ...(item.dateExpiration ? { dateExpiration: item.dateExpiration } : {}),
      regionId: item.regionId ?? null,
      communeId: item.communeId ?? null,
    });
  }

  /** Candidatures d'une opportunité : habitants de la localité en premier. */
  candidatures(id: string) {
    return this.api.get<Candidature[]>(`/api/v1/opportunites/${id}/candidatures`);
  }

  changerStatutCandidature(id: string, statut: StatutCandidature) {
    return this.api.patch<Candidature>(`/api/v1/opportunites/candidatures/${id}/statut`, { statut });
  }

  supprimer(id: string) {
    return this.api.delete<void>(`/api/v1/opportunites/${id}`);
  }
}