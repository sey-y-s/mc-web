import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Organisation } from '../../shared/models';

export interface OrganisationProfilRequest {
  nom: string;
  description: string;
  numeroRccm: string;
}

interface OrganisationResponse {
  id: string;
  utilisateurId: string;
  utilisateurEmail: string;
  nom: string;
  description: string | null;
  numeroRccm?: string | null;
  statut: Organisation['statut'];
}

/** Client strict du contrat OpenAPI actuellement disponible. */
@Injectable({ providedIn: 'root' })
export class OrganisationService {
  private readonly api = inject(ApiService);

  lister(): Observable<Organisation[]> {
    return this.api.get<OrganisationResponse[]>('/api/organisations').pipe(map((items) => (items ?? []).map((item) => this.toOrganisation(item))));
  }

  obtenir(id: string): Observable<Organisation> {
    return this.api.get<OrganisationResponse>(`/api/organisations/${id}`).pipe(map((item) => this.toOrganisation(item)));
  }

  obtenirPourUtilisateur(): Observable<Organisation> {
    return this.api.get<OrganisationResponse>('/api/organisations/me').pipe(map((item) => this.toOrganisation(item)));
  }

  /** Le backend déduit l'organisation du contexte authentifié : aucun ID d'organisation n'est envoyé. */
  modifierMonProfil(body: OrganisationProfilRequest): Observable<Organisation> {
    return this.api.put<OrganisationResponse>('/api/organisations/me', {
      nom: body.nom.trim(),
      description: body.description.trim(),
      numeroRccm: body.numeroRccm.trim(),
    }).pipe(map((item) => this.toOrganisation(item)));
  }

  private toOrganisation(item: OrganisationResponse): Organisation {
    return {
      id: item.id,
      utilisateurId: item.utilisateurId,
      utilisateurEmail: item.utilisateurEmail,
      email: item.utilisateurEmail,
      nom: item.nom,
      description: item.description ?? '',
      numeroRccm: item.numeroRccm ?? '',
      statut: item.statut,
    };
  }
}
