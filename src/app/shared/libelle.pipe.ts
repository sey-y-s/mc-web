import { Pipe, PipeTransform } from '@angular/core';

/** Libellés lisibles (français, accentués) pour les valeurs techniques renvoyées par l'API. */
const LIBELLES: Record<string, string> = {
  DEBUTANT: 'Débutant', INTERMEDIAIRE: 'Intermédiaire', AVANCE: 'Avancé', EXPERT: 'Expert',
  EN_ATTENTE: 'En attente', ACCEPTEE: 'Acceptée', REFUSEE: 'Refusée', ANNULEE: 'Annulée', EXPIREE: 'Expirée',
  OUVERT: 'Ouvert', BROUILLON: 'Brouillon', CLOTURE: 'Clôturé', CLOTUREE: 'Clôturée', ARCHIVE: 'Archivé',
  APPROUVEE: 'Approuvée', APPROUVE: 'Approuvé', REJETEE: 'Rejetée', REJETE: 'Rejeté', SUSPENDUE: 'Suspendue', SUSPENDU: 'Suspendu',
  VALIDE: 'Validée', VALIDEE: 'Validée', NON_VALIDE: 'Non validée', EN_COURS: 'En cours', TERMINE: 'Terminé', TERMINEE: 'Terminée',
  ACTIF: 'Actif', INACTIF: 'Inactif', PUBLIE: 'Publiée', PUBLIEE: 'Publiée', DEPUBLIEE: 'Dépubliée',
  CITOYEN: 'Citoyen', ORGANISATION: 'Organisation', INSTITUTION: 'Institution', CENTRE_ADMIN: 'Gestionnaire de centre',
  ADMIN: 'Administrateur', SUPER_ADMIN: 'Super-administrateur',
  OCCUPE: 'Occupé', DISPONIBLE: 'Disponible', INDISPONIBLE: 'Indisponible', ARCHIVEE: 'Archivée',
  FORMATION_GRATUITE: 'Formation gratuite', BOURSE: 'Bourse', INSERTION: 'Insertion', STAGE: 'Stage', EMPLOI: 'Emploi', FORMATION: 'Formation',
  SUCCESS: 'Succès', ECHEC: 'Échec', FAILURE: 'Échec', RETENUE: 'Retenue', NON_RETENUE: 'Non retenue',
  ORGANISATION_STATUT_MODIFIE: 'Statut d’organisation modifié', INCONNU: 'Inconnu',
  VERIFIEE: 'Vérifiée', DECLAREE: 'Déclarée', NON_VERIFIEE: 'Non vérifiée', A_REVALIDER: 'À revalider',
  INFO: 'Information', SUCCES: 'Succès', ALERTE: 'Alerte',
};

@Pipe({ name: 'libelle', standalone: true })
export class LibellePipe implements PipeTransform {
  transform(valeur: string | null | undefined): string {
    if (!valeur) return '—';
    const cle = String(valeur).trim();
    const connu = LIBELLES[cle.toUpperCase()];
    if (connu) return connu;
    // Valeur technique inconnue (MAJUSCULES_AVEC_TIRETS) : on la rend lisible sans inventer d'accents.
    if (/^[A-Z0-9_]+$/.test(cle)) { const t = cle.toLowerCase().replace(/_/g, ' '); return t.charAt(0).toUpperCase() + t.slice(1); }
    return cle;
  }
}
