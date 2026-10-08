import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { Competence, Talent, TalentSearchFilters } from '../../shared/models';

interface TalentResponse {
  id: string;
  pseudo: string;
  metierNom: string | null;
  secteurNom: string | null;
  localisation: string | null;
  disponibilite: string;
  estDisponible: boolean;
  competences: Array<{ id: string; nom: string }>;
}

@Injectable({ providedIn: 'root' })
export class TalentService {
  private readonly api = inject(ApiService);

  rechercher(filters: TalentSearchFilters = {}) {
    return this.api.get<TalentResponse[]>('/api/talents/recherche', {
      params: {
        competence: filters.competence ?? '',
        metier: filters.metier ?? '',
        localisation: filters.localisation ?? '',
        disponibilite: filters.disponibilite ?? '',
      },
    }).pipe(map((items) => items.map((item) => this.toTalent(item))));
  }

  obtenir(id: string) {
    return this.api.get<TalentResponse>(`/api/talents/${id}`).pipe(
      map((talent) => this.toTalent(talent)),
    );
  }

  private toTalent(item: TalentResponse): Talent {
    const competences: Competence[] = item.competences.map((competence) => ({
      id: competence.id,
      nom: competence.nom,
    }));
    return {
      id: item.id,
      nom: item.pseudo,
      pseudo: item.pseudo,
      metierNom: item.metierNom ?? undefined,
      secteurNom: item.secteurNom ?? undefined,
      localisation: item.localisation ?? undefined,
      disponibilite: item.disponibilite,
      estDisponible: item.estDisponible,
      competences,
    };
  }
}
