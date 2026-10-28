import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { Competence, Talent, TalentSearchFilters } from '../../shared/models';

interface TalentCompetenceResponse { id: string; nom: string; competenceId?: string; niveau?: 'DEBUTANT'|'INTERMEDIAIRE'|'EXPERT'; validee?: boolean; aPreuve?: boolean; parcours?: 'FORMEL' | 'INFORMEL' | null; }
interface TalentResponse {
  id: string; pseudo: string; metierNom?: string | null; secteurNom?: string | null; localisation?: string | null;
  disponibilite: string; estDisponible: boolean; competences: TalentCompetenceResponse[];
  regionId?: string; regionNom?: string; communeId?: string; communeNom?: string;
  nbValidations?: number; nbPreuves?: number; aPortfolio?: boolean;
}
@Injectable({ providedIn: 'root' })
export class TalentService {
  private readonly api = inject(ApiService);
  rechercher(filters: TalentSearchFilters = {}) {
    const params: Record<string, string | number> = {};
    for (const key of ['competence', 'metier', 'localisation', 'disponibilite', 'q', 'competenceId', 'metierId', 'regionId', 'communeId', 'niveauMin'] as const) {
      const value = filters[key];
      if (value !== undefined && value !== '') params[key] = value;
    }
    // The current OpenAPI response is a bare array without page metadata; the W4 screen paginates this result locally.
    if (filters.page !== undefined) params['page'] = filters.page;
    if (filters.size !== undefined) params['size'] = filters.size;
    return this.api.get<TalentResponse[]>('/api/v1/talents/recherche', { params }).pipe(map((items) => (items ?? []).map((item) => this.toTalent(item))));
  }
  obtenir(id: string) { return this.api.get<TalentResponse>(`/api/v1/talents/${id}`).pipe(map((item) => this.toTalent(item))); }
  private toTalent(item: TalentResponse): Talent {
    const skills = item.competences ?? [];
    const competences: Competence[] = skills.map((c) => ({ id: c.competenceId ?? c.id, nom: c.nom }));
    return {
      id: item.id, nom: item.pseudo, pseudo: item.pseudo, metierNom: item.metierNom ?? undefined,
      secteurNom: item.secteurNom ?? undefined, localisation: item.localisation ?? undefined,
      disponibilite: item.disponibilite, estDisponible: item.estDisponible, competences,
      regionId: item.regionId, regionNom: item.regionNom, communeId: item.communeId, communeNom: item.communeNom,
      nbValidations: item.nbValidations, nbPreuves: item.nbPreuves, aPortfolio: item.aPortfolio,
      competencesDetail: skills.map((c) => ({ id: c.id, competenceId: c.competenceId, nom: c.nom, niveau: c.niveau, validee: c.validee, aPreuve: c.aPreuve, parcours: c.parcours ?? null })),
    };
  }
}
