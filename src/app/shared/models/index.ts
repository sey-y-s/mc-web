export interface Competence {
  id: string;
  nom: string;
  description?: string;
  secteurNom?: string;
  metierNom?: string;
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
  titre: string;
  description?: string;
  statut: 'BROUILLON' | 'OUVERT' | 'CLOTURE';
  dateDebut?: string;
  dateFin?: string;
  dateCreation: string;
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
