import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { Talent } from '../../shared/models';

interface MatchingResponse {
  talentId: string;
  talent: {
    id: string;
    pseudo: string;
    metierNom: string | null;
    secteurNom: string | null;
    localisation: string | null;
    disponibilite: string;
    estDisponible: boolean;
    competences: Array<{ id: string; nom: string }>;
  };
  score: number;
  points: number;
  statut: 'EXCELLENT' | 'BON' | 'MOYEN';
  competencesCorrespondantes: string[];
  competencesManquantes: string[];
  explication: string;
}

export interface MatchingResult {
  talentId: string;
  talent?: Talent;
  score: number;
  points: number;
  statut: 'EXCELLENT' | 'BON' | 'MOYEN';
  competencesCorrespondantes?: string[];
  competencesManquantes?: string[];
  explication?: string;
}

@Injectable({ providedIn: 'root' })
export class MatchingService {
  private readonly api = inject(ApiService);

  listerPourBesoin(besoinId: string) {
    return this.api.get<MatchingResponse[]>(`/api/matching/besoins/${besoinId}`).pipe(
      map((items) =>
        items.map((item): MatchingResult => ({
          ...item,
          talent: {
            id: item.talent.id,
            nom: item.talent.pseudo,
            pseudo: item.talent.pseudo,
            metierNom: item.talent.metierNom ?? undefined,
            secteurNom: item.talent.secteurNom ?? undefined,
            localisation: item.talent.localisation ?? undefined,
            disponibilite: item.talent.disponibilite,
            estDisponible: item.talent.estDisponible,
            competences: item.talent.competences,
          } satisfies Talent,
        })),
      ),
    );
  }
}
