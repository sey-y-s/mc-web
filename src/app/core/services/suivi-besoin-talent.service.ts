import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { SuiviBesoinTalent } from '../../shared/models';

interface SuiviResponse {
  id: string;
  organisationId: string;
  besoinId: string;
  besoinTitre: string;
  citoyenId: string;
  citoyenNomComplet: string;
  statut: SuiviBesoinTalent['statut'];
  scoreCorrespondance: number | null;
  detailsCorrespondance: string | null;
  noteInterne: string | null;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface SuiviRequest {
  organisationId: string;
  besoinId: string;
  citoyenId: string;
  statut: SuiviBesoinTalent['statut'];
  scoreCorrespondance?: number;
  detailsCorrespondance?: string;
  noteInterne?: string;
}

@Injectable({ providedIn: 'root' })
export class SuiviBesoinTalentService {
  private readonly api = inject(ApiService);

  lister() {
    return this.api.get<SuiviResponse[]>('/api/suivi-talents/organisation').pipe(
      map((items): SuiviBesoinTalent[] =>
        items.map((item) => ({
          id: item.id,
          besoinId: item.besoinId,
          citoyenId: item.citoyenId,
          statut: item.statut,
          scoreCorrespondance: item.scoreCorrespondance ?? undefined,
          noteInterne: item.noteInterne ?? undefined,
          dateCreation: item.dateCreation,
          dateMiseAJour: item.dateMiseAJour,
        })),
      ),
    );
  }

  listerPourBesoin(besoinId: string) {
    return this.api.get<SuiviResponse[]>(`/api/suivi-talents/besoin/${besoinId}`).pipe(
      map((items): SuiviBesoinTalent[] =>
        items.map((item) => ({
          id: item.id,
          besoinId: item.besoinId,
          citoyenId: item.citoyenId,
          statut: item.statut,
          scoreCorrespondance: item.scoreCorrespondance ?? undefined,
          noteInterne: item.noteInterne ?? undefined,
          dateCreation: item.dateCreation,
          dateMiseAJour: item.dateMiseAJour,
        })),
      ),
    );
  }

  creer(body: SuiviRequest) {
    return this.api.post<SuiviResponse>('/api/suivi-talents', body);
  }

  mettreAJour(id: string, body: SuiviRequest) {
    return this.api.put<SuiviResponse>(`/api/suivi-talents/${id}`, body);
  }
}
