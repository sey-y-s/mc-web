import { Injectable, inject } from '@angular/core';
import { map, Observable, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Organisation, OrganisationDashboardMetrics } from '../../shared/models';

interface OrganisationResponse {
  id: string;
  utilisateurId: string;
  utilisateurEmail: string;
  nom: string;
  description: string | null;
  statut: Organisation['statut'];
}

interface OrganisationRequest {
  utilisateurId: string;
  nom: string;
  description: string | null;
  statut?: Organisation['statut'];
}

@Injectable({ providedIn: 'root' })
export class OrganisationService {
  private readonly api = inject(ApiService);

  lister() {
    return this.api.get<OrganisationResponse[]>('/api/organisations').pipe(
      map((items) => items.map((item) => this.toOrganisation(item))),
    );
  }

  obtenir(id: string) {
    return this.api.get<OrganisationResponse>(`/api/organisations/${id}`).pipe(
      map((item) => this.toOrganisation(item)),
    );
  }

  obtenirPourUtilisateur() {
    return this.api.get<OrganisationResponse>('/api/organisations/mine').pipe(
      map((item) => this.toOrganisation(item)),
    );
  }

  dashboard(): Observable<OrganisationDashboardMetrics> {
    return this.api.get<OrganisationDashboardMetrics>('/api/organisations/dashboard');
  }

  modifier(id: string, body: Partial<Organisation>) {
    if (!body.utilisateurId || !body.nom) {
      return throwError(
        () => new Error("L’identifiant utilisateur et le nom sont requis par l’API Organisation."),
      );
    }

    const request: OrganisationRequest = {
      utilisateurId: body.utilisateurId,
      nom: body.nom,
      description: body.description ?? null,
      statut: body.statut,
    };
    return this.api.put<OrganisationResponse>(`/api/organisations/${id}`, request).pipe(
      map((item) => this.toOrganisation(item)),
    );
  }

  private toOrganisation(item: OrganisationResponse): Organisation {
    return {
      id: item.id,
      utilisateurId: item.utilisateurId,
      utilisateurEmail: item.utilisateurEmail,
      email: item.utilisateurEmail,
      nom: item.nom,
      description: item.description ?? undefined,
      statut: item.statut,
    };
  }
}
