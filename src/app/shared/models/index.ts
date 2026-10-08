export interface Competence {
  id: string;
  nom: string;
  description?: string;
  secteurNom?: string;
  metierNom?: string;
}

export interface Organisation {
  id: string;
  utilisateurId?: string;
  utilisateurEmail?: string;
  nom: string;
  numeroSiren?: string;
  type?: string;
  statut?: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE' | 'SUSPENDUE';
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  description?: string;
  logoUrl?: string;
  dateCreation?: string;
}

export interface BesoinCompetence {
  id: string;
  besoinId: string;
  competenceId: string;
  competenceNom?: string;
  niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'EXPERT';
  quantite: number;
  requis?: boolean;
}

export interface Citoyen {
  id: string;
  nom: string;
  prenom: string;
  sexe?: string;
  photoUrl?: string;
  codePasseport?: string;
  disponibilite?: string;
  communeId?: string;
}

export interface Besoin {
  id: string;
  organisationId?: string;
  titre: string;
  description?: string;
  statut: 'BROUILLON' | 'OUVERT' | 'CLOTURE';
  dateDebut?: string | null;
  dateFin?: string | null;
  dateCreation: string;
  competences?: BesoinCompetence[];
}

export interface Talent {
  id: string;
  nom: string;
  prenom?: string;
  localisation?: string;
  disponibilite?: string;
  scoreGlobal?: number;
  competences?: Competence[];
  metierNom?: string;
  secteurNom?: string;
  description?: string;
  pseudo?: string;
  estDisponible?: boolean;
}

export interface TalentSearchFilters {
  competence?: string;
  metier?: string;
  localisation?: string;
  disponibilite?: string;
}

export interface DemandeMiseEnRelation {
  id: string;
  demandeurId: string;
  demandeurNomComplet?: string;
  destinataireId: string;
  destinataireNomComplet?: string;
  suiviBesoinTalentId?: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';
  message: string;
  dateDemande: string;
  dateReponse?: string;
}

export interface Validation {
  id: string;
  type: string;
  libelle: string;
  statut: 'EN_ATTENTE' | 'APPROUVEE' | 'REJETEE';
  dateCreation: string;
  certificatUrl?: string;
}

export interface TestQuestion {
  id: string;
  libelle: string;
  type: 'QCM' | 'OUVERT';
  points: number;
  propositions?: TestReponse[];
}

export interface TestReponse {
  id: string;
  libelle: string;
  estCorrecte?: boolean;
}

export interface TestNumerique {
  id: string;
  competenceId?: string;
  titre: string;
  description?: string;
  statut: 'BROUILLON' | 'PUBLIQUE' | 'ARCHIVE';
  difficulte?: 'DEBUTANT' | 'INTERMEDIAIRE' | 'AVANCE';
  questions?: TestQuestion[];
  dateCreation?: string;
}

export interface OrganisationDashboardMetrics {
  besoinsOuverts: number;
  talentsSuivis: number;
  misesEnRelation: number;
  notificationsNonLues: number;
}

export interface SuiviBesoinTalent {
  id: string;
  besoinId: string;
  citoyenId: string;
  statut: 'A_L_ETUDE' | 'CONTACT_EN_COURS' | 'MISE_EN_RELATION' | 'ARCHIVE';
  scoreCorrespondance?: number;
  noteInterne?: string;
  dateCreation: string;
  dateMiseAJour: string;
}

export interface SkillsGap {
  id: string;
  regionId: string;
  competenceId: string;
  competenceNom?: string;
  regionNom?: string;
  periodeDebut: string;
  periodeFin: string;
  dateCalcul: string;
  demandeEstimee: number;
  offreDisponible: number;
  ecart: number;
}

export interface Opportunite {
  id: string;
  titre: string;
  description?: string;
  type: string;
  statut: string;
  datePublication?: string;
  dateExpiration?: string;
  categorieNom?: string;
}

export interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  dateCreation: string;
  lu?: boolean;
}

export interface PageState {
  loading: boolean;
  error: string | null;
}
