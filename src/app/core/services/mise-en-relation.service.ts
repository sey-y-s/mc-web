import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { DemandeMiseEnRelation } from '../../shared/models';

export interface DemandeMiseEnRelationRequest {
  demandeurId: string;
  destinataireId: string;
  suiviBesoinTalentId?: string;
  statut: DemandeMiseEnRelation['statut'];
  message: string;
}

@Injectable({ providedIn: 'root' })
export class MiseEnRelationService {
  private readonly api = inject(ApiService);

  lister() {
    return this.api.get<DemandeMiseEnRelation[]>('/api/demandes-mise-en-relation');
  }

  creer(body: DemandeMiseEnRelationRequest) {
    return this.api.post<DemandeMiseEnRelation>('/api/demandes-mise-en-relation', body);
  }

  mettreAJour(id: string, body: DemandeMiseEnRelationRequest) {
    return this.api.put<DemandeMiseEnRelation>(`/api/demandes-mise-en-relation/${id}`, body);
  }
}
