import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { ApiService } from './api.service';
import { SkillsGap } from '../../shared/models';

/** Ligne calculée à la demande par le serveur (regionId nul = niveau national). */
export interface LigneSkillsGap {
  competenceId: string;
  competenceNom: string;
  regionId: string | null;
  regionCode: string | null;
  regionNom: string;
  offre: number;
  demande: number;
  ecart: number;
}

export interface SkillsGapCalcule {
  calculeLe: string;
  criteres: string;
  limites: string;
  lignes: LigneSkillsGap[];
}

/**
 * Indicateurs offre / demande / écart CALCULÉS À LA DEMANDE (consignes V1.2 : plus de snapshots).
 * Écart = offre − demande : négatif = pénurie.
 */
@Injectable({ providedIn: 'root' })
export class SkillsGapService {
  private readonly api = inject(ApiService);

  calculer(competenceId?: string) {
    return this.api.get<SkillsGapCalcule>('/api/v1/indicateurs/skills-gap', competenceId ? { params: { competenceId } } : undefined);
  }

  /** Vue régionale (sans la ligne nationale) au format des écrans existants. */
  lister() {
    return this.calculer().pipe(
      map((r) =>
        (r?.lignes ?? [])
          .filter((l) => l.regionId)
          .map<SkillsGap>((l) => ({
            id: `${l.competenceId}-${l.regionId}`,
            regionId: l.regionId!,
            competenceId: l.competenceId,
            competenceNom: l.competenceNom,
            regionNom: l.regionNom,
            periodeDebut: r.calculeLe?.slice(0, 10) ?? '',
            periodeFin: r.calculeLe?.slice(0, 10) ?? '',
            dateCalcul: r.calculeLe,
            demandeEstimee: l.demande,
            offreDisponible: l.offre,
            ecart: l.ecart,
          })),
      ),
    );
  }
}
