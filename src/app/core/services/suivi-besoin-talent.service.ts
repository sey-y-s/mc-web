import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { SuiviBesoinTalent } from '../../shared/models';

interface SuiviResponse {
  id: string; organisationId: string; besoinId: string; besoinTitre: string; citoyenId: string;
  citoyenNomComplet?: string; statut: SuiviBesoinTalent['statut']; scoreCorrespondance: number | null;
  detailsCorrespondance?: string | null; noteInterne: string | null; dateCreation: string; dateMiseAJour: string;
}
export interface SuiviRequest {
  /** Service de suivi des associations entre besoins et talents. */
  organisationId: string; besoinId: string; citoyenId: string; statut: SuiviBesoinTalent['statut'];
  scoreCorrespondance?: number; detailsCorrespondance?: string; noteInterne?: string;
}
@Injectable({ providedIn: 'root' })
export class SuiviBesoinTalentService {
  private readonly api = inject(ApiService);
  listerPourBesoin(besoinId: string) {
    return this.api.get<SuiviResponse[]>(`/api/suivi-talents/besoin/${besoinId}`).pipe(map((items) => (items ?? []).map((item) => this.toSuivi(item))));
  }
  obtenir(id: string) { return this.api.get<SuiviResponse>(`/api/suivi-talents/${id}`).pipe(map((item) => this.toSuivi(item))); }
  creer(body: SuiviRequest) { return this.api.post<SuiviResponse>('/api/suivi-talents', body).pipe(map((item) => this.toSuivi(item))); }
  mettreAJour(id: string, body: SuiviRequest) { return this.api.put<SuiviResponse>(`/api/suivi-talents/${id}`, body).pipe(map((item) => this.toSuivi(item))); }
  supprimer(id: string) { return this.api.delete<void>(`/api/suivi-talents/${id}`); }
  private toSuivi(item: SuiviResponse): SuiviBesoinTalent {
    // citoyenNomComplet est volontairement ignoré : il ne doit jamais être exposé à l'organisation.
    return { id: item.id, besoinId: item.besoinId, besoinTitre: item.besoinTitre, citoyenId: item.citoyenId,
      statut: item.statut, scoreCorrespondance: item.scoreCorrespondance ?? undefined,
      noteInterne: item.noteInterne ?? undefined, dateCreation: item.dateCreation, dateMiseAJour: item.dateMiseAJour };
  }
}
