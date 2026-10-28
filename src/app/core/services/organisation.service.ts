import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { Organisation } from '../../shared/models';
import { TypeDocument, TypeOrganisation } from '../organisation/organisation-legal';

/** Identité juridique et coordonnées (inscription et profil). */
export interface OrganisationIdentite {
  typeOrganisation: TypeOrganisation | null;
  sigle?: string | null;
  formeJuridique?: string | null;
  secteurActivite?: string | null;
  dateCreation?: string | null;
  effectif?: number | null;
  numeroRccm?: string | null;
  nif?: string | null;
  numeroInps?: string | null;
  numeroRecepisse?: string | null;
  numeroAccordCadre?: string | null;
  referenceActe?: string | null;
  adresse?: string | null;
  communeId?: string | null;
  siteWeb?: string | null;
  responsableNom?: string | null;
  responsableFonction?: string | null;
  responsableTelephone?: string | null;
}

export interface OrganisationProfilRequest {
  nom: string;
  description: string;
  identite?: OrganisationIdentite;
}

export interface OrganisationDocument {
  id: string;
  organisationId: string;
  typeDocument: TypeDocument;
  typeDocumentLibelle: string;
  nomFichier: string;
  typeContenu?: string | null;
  tailleOctets?: number | null;
  statut: 'EN_ATTENTE' | 'VALIDE' | 'REJETE';
  commentaire?: string | null;
  dateDepot: string;
}

interface OrganisationResponse extends Omit<OrganisationIdentite, 'typeOrganisation'> {
  id: string;
  utilisateurId: string;
  utilisateurEmail: string;
  nom: string;
  description: string | null;
  statut: Organisation['statut'];
  motifStatut?: string | null;
  typeOrganisation?: TypeOrganisation | null;
  typeOrganisationLibelle?: string | null;
  telephone?: string | null;
  communeNom?: string | null;
  regionId?: string | null;
  regionNom?: string | null;
  documentsObligatoires?: TypeDocument[];
  documentsConseilles?: TypeDocument[];
  documentsManquants?: TypeDocument[];
  nombreDocuments?: number;
  dossierComplet?: boolean;
}

/** Client du contrat organisation (profil, identité juridique, pièces justificatives). */
@Injectable({ providedIn: 'root' })
export class OrganisationService {
  private readonly api = inject(ApiService);

  lister(): Observable<Organisation[]> {
    return this.api.get<OrganisationResponse[]>('/api/v1/organisations').pipe(map((items) => (items ?? []).map((item) => this.toOrganisation(item))));
  }

  obtenir(id: string): Observable<Organisation> {
    return this.api.get<OrganisationResponse>(`/api/v1/organisations/${id}`).pipe(map((item) => this.toOrganisation(item)));
  }

  obtenirPourUtilisateur(): Observable<Organisation> {
    return this.api.get<OrganisationResponse>('/api/v1/organisations/me').pipe(map((item) => this.toOrganisation(item)));
  }

  /** Le backend déduit l'organisation du contexte authentifié : aucun ID d'organisation n'est envoyé. */
  modifierMonProfil(body: OrganisationProfilRequest): Observable<Organisation> {
    return this.api.put<OrganisationResponse>('/api/v1/organisations/me', {
      nom: body.nom.trim(),
      description: body.description.trim(),
      ...(body.identite ? { identite: body.identite } : {}),
    }).pipe(map((item) => this.toOrganisation(item)));
  }

  // ----- Pièces justificatives -----

  mesDocuments(): Observable<OrganisationDocument[]> {
    return this.api.get<OrganisationDocument[]>('/api/v1/organisations/me/documents');
  }

  deposerDocument(type: TypeDocument, fichier: File): Observable<OrganisationDocument> {
    const form = new FormData();
    form.append('type', type);
    form.append('fichier', fichier, fichier.name);
    return this.api.post<OrganisationDocument>('/api/v1/organisations/me/documents', form);
  }

  supprimerDocument(id: string): Observable<void> {
    return this.api.delete<void>(`/api/v1/organisations/me/documents/${id}`);
  }

  /** Contenu du fichier (organisation propriétaire ou administration). */
  fichierDocument(id: string): Observable<Blob> {
    return this.api.getBlob(`/api/v1/organisations/documents/${id}/fichier`);
  }

  documentsOrganisation(organisationId: string): Observable<OrganisationDocument[]> {
    return this.api.get<OrganisationDocument[]>(`/api/v1/organisations/${organisationId}/documents`);
  }

  verifierDocument(id: string, statut: 'VALIDE' | 'REJETE', commentaire?: string): Observable<OrganisationDocument> {
    return this.api.patch<OrganisationDocument>(`/api/v1/organisations/documents/${id}/verification`, { statut, commentaire: commentaire?.trim() || null });
  }

  private toOrganisation(item: OrganisationResponse): Organisation {
    return {
      ...item,
      email: item.utilisateurEmail,
      description: item.description ?? '',
      numeroRccm: item.numeroRccm ?? '',
      type: item.typeOrganisationLibelle ?? undefined,
    } as Organisation;
  }
}
