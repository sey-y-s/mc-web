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
  dateExpiration?: string | null; // AAAA-MM-JJ
}

export interface OpportuniteDetail extends Opportunite {
  categorieId?: string;
}

@Injectable({ providedIn: 'root' })
export class OpportuniteService {
  private readonly api = inject(ApiService);

  // Public : uniquement les opportunités publiées et non expirées. 
  listerPubliees() {
    return this.api.get<OpportuniteDetail[]>('/api/opportunites');
  }

  // Super admin : toutes les opportunités, tous statuts. 
  listerPourGestion() {
    return this.api.get<OpportuniteDetail[]>('/api/opportunites/gestion');
  }

  // Admin (lecture seule). 
  listerPourAdmin() {
    return this.api.get<OpportuniteDetail[]>('/api/admin/opportunites');
  }

  creer(body: OpportuniteRequest) {
    return this.api.post<OpportuniteDetail>('/api/opportunites', body);
  }

  modifier(id: string, body: OpportuniteRequest) {
    return this.api.put<OpportuniteDetail>(`/api/opportunites/${id}`, body);
  }

  // Publier ou archiver = un PUT complet avec le nouveau statut. 
  changerStatut(item: OpportuniteDetail, statut: StatutOpportunite) {
    return this.modifier(item.id, {
      categorieId: item.categorieId ?? '',
      titre: item.titre,
      description: item.description ?? '',
      statut,
      type: item.type as TypeOpportunite,
      dateExpiration: item.dateExpiration ?? null,
    });
  }

  supprimer(id: string) {
    return this.api.delete<void>(`/api/opportunites/${id}`);
  }
}