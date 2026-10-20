import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { Besoin, BesoinCompetence } from '../../shared/models';

interface BesoinResponse {
  id: string;
  organisationId: string;
  organisationNom: string;
  titre: string;
  description: string | null;
  statut: Besoin['statut'];
  dateDebut: string | null;
  dateFin: string | null;
  dateCreation: string;
  competences: Array<{
    id: string;
    competenceId: string;
    competenceNom: string;
    niveauMinimum: BesoinCompetence['niveau'];
    quantite: number;
  }>;
}

export interface BesoinCreateRequest {
  organisationId: string;
  titre: string;
  description: string;
  statut: Besoin['statut'];
  dateDebut: string | null;
  dateFin: string | null;
  competences: Array<{
    competenceId: string;
    niveauMinimum: BesoinCompetence['niveau'];
    quantite: number;
  }>;
}

@Injectable({ providedIn: 'root' })
export class BesoinService {
  private readonly api = inject(ApiService);

  lister() {
    return this.api.get<BesoinResponse[]>('/api/besoins').pipe(
      map((items) => (items ?? []).map((item) => this.toBesoin(item))),
    );
  }

  obtenir(id: string) {
    return this.api.get<BesoinResponse>(`/api/besoins/${id}`).pipe(
      map((item) => this.toBesoin(item)),
    );
  }

  creer(body: BesoinCreateRequest) {
    // Le schéma V1 rend organisationId obligatoire ; le serveur doit impérativement le recouper avec le principal authentifié.
    return this.api.post<BesoinResponse>('/api/besoins', body).pipe(map((item) => this.toBesoin(item)));
  }

  modifier(id: string, body: BesoinCreateRequest) {
    return this.api.put<BesoinResponse>(`/api/v1/besoins/${id}`, body).pipe(map((item) => this.toBesoin(item)));
  }

  cloturer(id: string) {
    return this.api.patch<BesoinResponse>(`/api/v1/besoins/${id}/cloture`, {}).pipe(map((item) => this.toBesoin(item)));
  }

  supprimer(id: string) { return this.api.delete<void>(`/api/v1/besoins/${id}`); }

  tableauDeBordOrganisation() {
    return this.api.get<{ statutOrganisation: string; besoinsBrouillon: number; besoinsOuverts: number; besoinsClotures: number }>('/api/v1/organisations/me/tableau-de-bord');
  }

  private toBesoin(item: BesoinResponse): Besoin {
    return {
      id: item.id,
      organisationId: item.organisationId,
      titre: item.titre,
      description: item.description ?? undefined,
      statut: item.statut,
      dateCreation: item.dateCreation,
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
      competences: (item.competences ?? []).map((competence) => ({
        id: competence.id,
        besoinId: item.id,
        competenceId: competence.competenceId,
        competenceNom: competence.competenceNom,
        niveau: competence.niveauMinimum,
        quantite: competence.quantite,
      })),
    };
  }
}
