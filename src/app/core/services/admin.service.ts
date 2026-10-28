import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Opportunite, Competence } from '../../shared/models';

export type ModaliteValidation = 'DOCUMENTAIRE' | 'TEST_NUMERIQUE' | 'PRATIQUE_CENTRE' | 'PORTFOLIO_MEDIA' | 'MAITRE_ARTISAN';
/** Règle de validation d'une compétence (par défaut tant que rien n'est configuré : parDefaut = true). */
export interface RegleValidation {
  modalite: ModaliteValidation;
  libelle: string;
  ordre: number;
  actif: boolean;
  seuilReussite: number | null;
  piecesAdmissibles: string[];
  profilsHabilites: string | null;
  criteres: string | null;
  parDefaut: boolean;
}
export interface RegleValidationRequest {
  modalite: ModaliteValidation;
  ordre: number;
  actif: boolean;
  seuilReussite: number | null;
  piecesAdmissibles: string[];
  profilsHabilites: string | null;
  criteres: string | null;
}

export type AdminQuestionType = 'CHOIX_UNIQUE' | 'CHOIX_MULTIPLE' | 'VRAI_FAUX' | 'TEXTE_LIBRE';
export interface AdminQuestionRequest {
  texte: string;
  type: AdminQuestionType;
  ordre: number;
  propositions?: Array<{ texte: string; correcte: boolean }>;
}
export interface AdminTestRequest {
  competenceId: string;
  titre: string;
  description: string;
  actif: boolean;
  questions: AdminQuestionRequest[];
}
export interface AdminTestNumerique {
  id: string;
  competenceId?: string;
  titre: string;
  description?: string;
  statut: string;
  questions?: Array<{
    id: string; libelle: string; type: AdminQuestionType; ordre: number;
    propositions: Array<{ id: string; libelle: string; estCorrecte: boolean }>;
  }>;
}
export interface EvaluateurCentreAdmin { id:string; citoyenId:string; nomCitoyen:string; prenomCitoyen:string; centreId:string; nomCentre:string; specialite?:string; actif:boolean; dateDesignation?:string }
export type StatutCentre = 'EN_ATTENTE' | 'ACTIF' | 'SUSPENDU';
export interface CentreAdmin { id: string; nom: string; description?: string; adresse?: string; telephone?: string; administrateurId?: string | null; administrateurEmail?: string | null; statut?: StatutCentre; nombreCompetencesAgreees?: number }
/** Agrément d'un centre : seul un centre ACTIF évalue, et seulement les compétences agréées. */
export interface AgrementCentre { centreId: string; centreNom: string; statut: StatutCentre; competences: Array<{ id: string; nom: string }> }
export interface HabilitationEvaluateur { centreId: string; citoyenId: string; actif: boolean; dateFin?: string | null; toutesCompetencesAgreees: boolean; competences: Array<{ id: string; nom: string }> }
export type StatutContestation = 'OUVERTE' | 'EN_EXAMEN' | 'ACCEPTEE' | 'REJETEE';
export interface ContestationAdmin {
  id: string; citoyenId: string; citoyenNom: string;
  typeObjet: 'DECISION_VALIDATION' | 'DONNEE_PROFIL' | 'AUTRE';
  validationId?: string | null; competenceNom?: string | null; decisionContestee?: 'APPROUVEE' | 'REJETEE' | 'EN_ATTENTE' | null;
  champConcerne?: string | null; motif: string; statut: StatutContestation; reponse?: string | null;
  nouvelleDecisionId?: string | null; nouvelleDecision?: 'APPROUVEE' | 'REJETEE' | null;
  dateCreation: string; dateTraitement?: string | null;
}
export interface RegionAdmin { id: string; nom: string; description?: string; codeStable?: string; niveau?: 'REGION' | 'DISTRICT' | string }
export interface CommuneAdmin { id: string; nom: string; description?: string; regionId: string; regionNom?: string }
export interface CategorieOpportunite { id: string; nom: string; description?: string }
export interface NotificationAdminRequest {
  titre: string; message: string;
  type: 'MISE_EN_RELATION' | 'VALIDATION' | 'OPPORTUNITE' | 'BESOIN_COMPETENCE' | 'SYSTEME';
  destinatairesIds: string[];
}
export interface OrganisationAdmin { id: string; utilisateurId?: string; email?: string; nom: string; description?: string; numeroRccm?: string | null; nif?: string | null; statut: string; motifStatut?: string; typeOrganisation?: string | null; typeOrganisationLibelle?: string | null; communeNom?: string | null; regionNom?: string | null; nombreDocuments?: number; nombreDocumentsManquants?: number; dossierComplet?: boolean }
export interface CitoyenAdmin { id: string; nom: string; prenom: string; disponibilite?: string }
export interface AdminDashboard { citoyens?: number; organisations?: number; validations?: number; tests?: number; besoins?: number; misesEnRelation?: number }
export interface AdminValidation { id: string; type: string; libelle: string; statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE'; }


export interface AdminUser {
  id: string;
  email?: string;
  telephone: string;
  role: 'CITOYEN' | 'ORGANISATION' | 'CENTRE_ADMIN' | 'ADMIN' | 'SUPER_ADMIN' | 'INSTITUTION' | 'AGENT_TERRAIN';
  actif: boolean;
  dateCreation: string;
}



export interface AuditLog { id: string; action: string; targetType?: string; targetId?: string; resultCode?: string; createdAt?: string; actorId?: string; }
export interface AuditPage { content?: AuditLog[]; items?: AuditLog[]; totalElements?: number; totalPages?: number; number?: number; size?: number; }
export interface ReferentielSecteur { id: string; nom: string; description?: string | null; }
export interface ReferentielMetier { id: string; secteurId: string; secteurNom?: string; nom: string; description?: string | null; }
export type ParcoursCompetence = 'FORMEL' | 'INFORMEL';
export interface ReferentielCompetence { id: string; metierId: string; metierNom?: string; secteurId?: string; secteurNom?: string; nom: string; description?: string | null; parcoursPossibles?: ParcoursCompetence[]; }
export interface InstitutionIndicateur { regionCode: string; regionNom: string; competenceId: string; competenceNom: string; periodeDebut: string; periodeFin: string; offre: number | null; demande: number | null; ecart: number | null; statutConfidentialite: string; motifMasquage?: string | null; }
export interface InstitutionPeriode { debut: string; fin: string; }
export interface TerritoireStable { id: string; nom: string; niveau: string; codeStable: string; parentId?: string | null; }
export interface TerritoireIndicateurs { competenceId: string; periodeDebut: string; periodeFin: string; mesure: 'OFFRE' | 'DEMANDE' | 'ECART'; items: InstitutionIndicateur[]; }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  dashboard() {
    return this.api.get<AdminDashboard>('/api/v1/admin/dashboard');
  }

  citoyens() {
    return this.api.get<CitoyenAdmin[]>('/api/v1/admin/citoyens');
  }

  organisations() {
    return this.api.get<OrganisationAdmin[]>('/api/v1/admin/organisations');
  }

  modifierStatutOrganisation(id: string, statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'SUSPENDUE', motif?: string) {
    return this.api.patch<OrganisationAdmin>(`/api/v1/admin/organisations/${id}/statut`, { statut, ...(motif?.trim() ? { motif: motif.trim() } : {}) });
  }

  validations() { return this.api.get<AdminValidation[]>('/api/v1/admin/validations'); }

  modifierStatutValidation(id: string, statut: AdminValidation['statut'], commentaire?: string) {
    return this.api.patch<AdminValidation>(`/api/v1/admin/validations/${id}/statut`, { statut, ...(commentaire ? { commentaire } : {}) });
  }

  testsNumeriques() { return this.api.get<AdminTestNumerique[]>('/api/v1/admin/tests-numeriques'); }
  creerTest(body: AdminTestRequest) { return this.api.post<AdminTestNumerique>('/api/v1/admin/tests-numeriques', body); }
  modifierTest(id: string, body: AdminTestRequest) { return this.api.put<AdminTestNumerique>(`/api/v1/admin/tests-numeriques/${id}`, body); }
  archiverTest(id: string) { return this.api.delete<void>(`/api/v1/admin/tests-numeriques/${id}`); }


  opportunites() {
    return this.api.get<Opportunite[]>('/api/v1/admin/opportunites');
  }

  centres() { return this.api.get<CentreAdmin[]>('/api/v1/admin/centres'); }
  creerCentre(body: Omit<CentreAdmin, 'id'>) { return this.api.post<CentreAdmin>('/api/v1/centres', body); }
  modifierCentre(id: string, body: Omit<CentreAdmin, 'id'>) { return this.api.put<CentreAdmin>(`/api/v1/centres/${id}`, body); }
  supprimerCentre(id: string) { return this.api.delete<void>(`/api/v1/centres/${id}`); }
  affecterGestionnaireCentre(centreId: string, utilisateurId: string) { return this.api.patch<{centreId:string; administrateurId:string; role:string}>(`/api/v1/admin/centres/${centreId}/administrateur/${utilisateurId}`, {}); }
  agrementCentre(centreId: string) { return this.api.get<AgrementCentre>(`/api/v1/admin/centres/${centreId}/agrement`); }
  modifierAgrementCentre(centreId: string, body: { statut: StatutCentre; competenceIds: string[] }) { return this.api.put<AgrementCentre>(`/api/v1/admin/centres/${centreId}/agrement`, body); }
  /** Habilitation d'un évaluateur : compétences (parmi celles agréées pour le centre) et fin de validité. */
  habilitation(centreId: string, citoyenId: string) { return this.api.get<HabilitationEvaluateur>(`/api/v1/centres/${centreId}/evaluateurs/${citoyenId}/habilitation`); }
  modifierHabilitation(centreId: string, citoyenId: string, body: { competenceIds: string[]; dateFin: string | null }) { return this.api.put<HabilitationEvaluateur>(`/api/v1/centres/${centreId}/evaluateurs/${citoyenId}/habilitation`, body); }
  contestations(enCours = true) { return this.api.get<ContestationAdmin[]>('/api/v1/admin/contestations', { params: { enCours } }); }
  traiterContestation(id: string, body: { statut: StatutContestation; reponse?: string; nouvelleDecision?: 'APPROUVEE' | 'REJETEE'; niveauValide?: string }) { return this.api.patch<ContestationAdmin>(`/api/v1/admin/contestations/${id}`, body); }
  retirerGestionnaireCentre(centreId: string) { return this.api.delete<void>(`/api/v1/admin/centres/${centreId}/administrateur`); }
  centreAdminMonCentre() { return this.api.get<CentreAdmin>('/api/v1/centre-admin/mon-centre'); }
  centreAdminCitoyens() { return this.api.get<Array<{id:string; nom:string; prenom:string}>>('/api/v1/centre-admin/citoyens'); }
  centreAdminEvaluateurs() { return this.api.get<EvaluateurCentreAdmin[]>('/api/v1/centre-admin/evaluateurs'); }
  centreAdminDesignerEvaluateur(body: {citoyenId:string; specialite?:string}) { return this.api.post<EvaluateurCentreAdmin>('/api/v1/centre-admin/evaluateurs', body); }
  centreAdminModifierEvaluateur(citoyenId:string, actif:boolean) { return this.api.patch<EvaluateurCentreAdmin>(`/api/v1/centre-admin/evaluateurs/${citoyenId}/activation`, {actif}); }

  regions() { return this.api.get<RegionAdmin[]>('/api/v1/regions'); }
  creerRegion(body: Omit<RegionAdmin, 'id'>) { return this.api.post<RegionAdmin>('/api/v1/regions', body); }
  modifierRegion(id: string, body: Omit<RegionAdmin, 'id'>) { return this.api.put<RegionAdmin>(`/api/v1/regions/${id}`, body); }
  supprimerRegion(id: string) { return this.api.delete<void>(`/api/v1/regions/${id}`); }
  communes() { return this.api.get<CommuneAdmin[]>('/api/v1/communes'); }
  creerCommune(body: Omit<CommuneAdmin, 'id' | 'regionNom'>) { return this.api.post<CommuneAdmin>('/api/v1/communes', body); }
  modifierCommune(id: string, body: Omit<CommuneAdmin, 'id' | 'regionNom'>) { return this.api.put<CommuneAdmin>(`/api/v1/communes/${id}`, body); }
  supprimerCommune(id: string) { return this.api.delete<void>(`/api/v1/communes/${id}`); }

  categoriesOpportunites() { return this.api.get<CategorieOpportunite[]>('/api/v1/categories-opportunites'); }
  creerCategorieOpportunite(body: { nom: string; description?: string }) { return this.api.post<CategorieOpportunite>('/api/v1/categories-opportunites', body); }
  supprimerCategorieOpportunite(id: string) { return this.api.delete<void>(`/api/v1/categories-opportunites/${id}`); }
  envoyerNotification(body: NotificationAdminRequest) { return this.api.post<void>('/api/v1/notifications', body); }


  competences() { return this.api.get<Competence[]>('/api/v1/admin/competences'); }

  users() {
    return this.api.get<AdminUser[]>('/api/v1/admin/users');
  }

  modifierRole(id: string, role: AdminUser['role']) {
    return this.api.put<AdminUser>(`/api/v1/admin/users/${id}/role`, { role });
  }

  modifierStatutUtilisateur(id: string, actif: boolean) {
    return this.api.put<AdminUser>(`/api/v1/admin/users/${id}/statut`, { actif });
  }

  auditLogs(page = 0, size = 25) {
    return this.api.get<AuditPage | AuditLog[]>('/api/v1/admin/audit-logs', { params: { page, size } });
  }

  secteurs() { return this.api.get<ReferentielSecteur[]>('/api/v1/admin/referentiel/secteurs'); }
  creerSecteur(body: Omit<ReferentielSecteur, 'id'>) { return this.api.post<ReferentielSecteur>('/api/v1/admin/referentiel/secteurs', body); }
  modifierSecteur(id: string, body: Omit<ReferentielSecteur, 'id'>) { return this.api.put<ReferentielSecteur>(`/api/v1/admin/referentiel/secteurs/${id}`, body); }
  supprimerSecteur(id: string) { return this.api.delete<void>(`/api/v1/admin/referentiel/secteurs/${id}`); }
  metiers() { return this.api.get<ReferentielMetier[]>('/api/v1/admin/referentiel/metiers'); }
  creerMetier(body: Omit<ReferentielMetier, 'id'|'secteurNom'>) { return this.api.post<ReferentielMetier>('/api/v1/admin/referentiel/metiers', body); }
  modifierMetier(id: string, body: Omit<ReferentielMetier, 'id'|'secteurNom'>) { return this.api.put<ReferentielMetier>(`/api/v1/admin/referentiel/metiers/${id}`, body); }
  supprimerMetier(id: string) { return this.api.delete<void>(`/api/v1/admin/referentiel/metiers/${id}`); }
  referentielCompetences() { return this.api.get<ReferentielCompetence[]>('/api/v1/admin/referentiel/competences'); }
  creerReferentielCompetence(body: Omit<ReferentielCompetence, 'id'|'metierNom'|'secteurNom'|'secteurId'>) { return this.api.post<ReferentielCompetence>('/api/v1/admin/referentiel/competences', body); }
  modifierReferentielCompetence(id: string, body: Omit<ReferentielCompetence, 'id'|'metierNom'|'secteurNom'|'secteurId'>) { return this.api.put<ReferentielCompetence>(`/api/v1/admin/referentiel/competences/${id}`, body); }
  supprimerReferentielCompetence(id: string) { return this.api.delete<void>(`/api/v1/admin/referentiel/competences/${id}`); }

  // Localisation d'un centre (commune) : sert à proposer aux citoyens les centres proches d'eux
  communeCentre(centreId: string) { return this.api.get<{ communeId: string | null; communeNom: string | null; regionNom: string | null }>(`/api/v1/centres/${centreId}/commune`); }
  definirCommuneCentre(centreId: string, communeId: string | null) { return this.api.put<void>(`/api/v1/centres/${centreId}/commune`, { communeId }); }

  // Règles de validation par compétence (moteur d'orientation)
  reglesValidation(competenceId: string) { return this.api.get<RegleValidation[]>(`/api/v1/admin/competences/${competenceId}/modalites`); }
  enregistrerReglesValidation(competenceId: string, body: RegleValidationRequest[]) { return this.api.put<RegleValidation[]>(`/api/v1/admin/competences/${competenceId}/modalites`, body); }
  reinitialiserReglesValidation(competenceId: string) { return this.api.delete<RegleValidation[]>(`/api/v1/admin/competences/${competenceId}/modalites`); }

  // Indicateurs calculés à la demande : situation au jour de la consultation (plus de trimestres à saisir).
  institutionSkillsGap(competenceId: string) { return this.api.get<InstitutionIndicateur[]>('/api/v1/institution/skills-gap', { params: { competenceId } }); }
  institutionDashboard(competenceId: string) { return this.api.get<{ cellulesVisibles: number; cellulesMasquees: number; competencesEnTension: InstitutionIndicateur[] }>('/api/v1/institution/tableau-de-bord', { params: { competenceId } }); }
  institutionCompetences() { return this.api.get<Array<{id:string; nom:string}>>('/api/v1/institution/competences'); }
  institutionPeriodes(competenceId: string) { return this.api.get<InstitutionPeriode[]>('/api/v1/institution/periodes', { params: { competenceId } }); }
  territoiresOfficiels(niveau = 'REGION') { return this.api.get<TerritoireStable[]>('/api/v1/territoires', { params: { niveau } }); }
  territoireParCode(codeStable: string) { return this.api.get<TerritoireStable>(`/api/v1/territoires/code/${encodeURIComponent(codeStable)}`); }
  territoireIndicateurs(competenceId: string, mesure: 'OFFRE'|'DEMANDE'|'ECART' = 'ECART') { return this.api.get<TerritoireIndicateurs>('/api/v1/territoires/indicateurs', { params: { competenceId, mesure } }); }
  exporterInstitutionSkillsGap(competenceId: string) { return this.api.getBlob('/api/v1/institution/skills-gap/export', { params: { competenceId } }); }
}
