import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { DemandeMiseEnRelation } from '../../shared/models';
export interface DemandeMiseEnRelationRequest { destinataireId: string; suiviBesoinTalentId: string; message: string; }
interface DemandeResponse { id: string; demandeurId: string; demandeurNomComplet?: string; destinataireId: string; destinataireNomComplet?: string; suiviBesoinTalentId?: string; SuiviBesoinTalentId?: string; statut: DemandeMiseEnRelation['statut']; message: string; dateDemande: string; dateReponse?: string; contactTelephone?: string; contactEmail?: string; }
@Injectable({ providedIn: 'root' })
export class MiseEnRelationService {
  private readonly api = inject(ApiService);
  // Demandes de l'organisation connectée (la liste complète est réservée à l'administration : 403).
  lister() { return this.api.get<DemandeResponse[]>('/api/v1/demandes-mise-en-relation/mes-demandes').pipe(map((rows) => (rows ?? []).map((row) => this.safe(row)))); }
  creer(body: DemandeMiseEnRelationRequest) { return this.api.post<DemandeResponse>('/api/v1/demandes-mise-en-relation', body).pipe(map((row) => this.safe(row))); }
  private safe(row: DemandeResponse): DemandeMiseEnRelation {
    // Les noms complets du DTO sont délibérément jetés avant que les données n'atteignent les composants.
    return { id: row.id, demandeurId: row.demandeurId, destinataireId: row.destinataireId,
      suiviBesoinTalentId: row.suiviBesoinTalentId ?? row.SuiviBesoinTalentId, statut: row.statut,
      message: row.message, dateDemande: row.dateDemande, dateReponse: row.dateReponse,
      contactTelephone: row.contactTelephone, contactEmail: row.contactEmail };
  }
}
