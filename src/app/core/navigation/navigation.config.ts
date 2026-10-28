import { UserRole } from '../auth/user-role.enum';

export interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly roles: readonly UserRole[];
  readonly section: string;
}

const organisations: readonly UserRole[] = [UserRole.ORGANISATION];
const administrators: readonly UserRole[] = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
const superAdministrators: readonly UserRole[] = [UserRole.SUPER_ADMIN];
const institutions: readonly UserRole[] = [UserRole.INSTITUTION];
const centreAdministrators: readonly UserRole[] = [UserRole.CENTRE_ADMIN];

/**
 * Source unique des entrées de navigation Web.
 * Les rôles correspondent aux rôles reconnus par l’application.
 * Aucun rôle Gestionnaire ou espace Évaluateur Web n'est créé ici.
 */
// Notifications et profil : accessibles depuis l'en-tête (cloche et avatar), pas dans la barre latérale.
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Mon centre', path: '/app/centre-admin', roles: centreAdministrators, section: 'Centre' },
  { label: 'Vue d’ensemble', path: '/app/organisation/tableau-de-bord', roles: organisations, section: 'Principal' },
  { label: 'Mon organisation', path: '/app/organisation/profil', roles: organisations, section: 'Organisation' },
  { label: 'Besoins', path: '/app/organisation/besoins', roles: organisations, section: 'Organisation' },
  { label: 'Carte des talents', path: '/app/carte-talents', roles: organisations, section: 'Organisation' },
  { label: 'Recherche de talents', path: '/app/organisation/talents', roles: organisations, section: 'Organisation' },
  { label: 'Suivi des talents', path: '/app/organisation/suivi', roles: organisations, section: 'Organisation' },
  { label: 'Mises en relation', path: '/app/organisation/relations', roles: organisations, section: 'Organisation' },
  { label: 'Vue d’ensemble', path: '/app/admin/tableau-de-bord', roles: administrators, section: 'Administration' },
  { label: 'Validations', path: '/app/admin/validations', roles: administrators, section: 'Administration' },
  { label: 'Contestations', path: '/app/admin/contestations', roles: administrators, section: 'Administration' },
  { label: 'Tests numériques', path: '/app/admin/tests-numeriques', roles: administrators, section: 'Administration' },
  { label: 'Règles de validation', path: '/app/admin/regles-validation', roles: administrators, section: 'Administration' },
  { label: 'Référentiel', path: '/app/admin/referentiel', roles: administrators, section: 'Administration' },
  { label: 'Carte des talents', path: '/app/carte-talents', roles: administrators, section: 'Observatoire' },
  { label: 'Skills-Gap', path: '/app/admin/skills-gap', roles: administrators, section: 'Observatoire' },
  { label: 'Citoyens', path: '/app/admin/citoyens', roles: administrators, section: 'Administration' },
  { label: 'Organisations', path: '/app/admin/organisations', roles: administrators, section: 'Administration' },
  { label: 'Centres', path: '/app/admin/centres', roles: administrators, section: 'Administration' },
  { label: 'Territoires', path: '/app/admin/territoires', roles: administrators, section: 'Référentiels' },
  { label: 'Opportunités (lecture)', path: '/app/admin/opportunites', roles: administrators, section: 'Publication' },
  { label: 'Envoi de notifications', path: '/app/admin/notifications', roles: administrators, section: 'Administration' },
  { label: 'Audit', path: '/app/admin/audit', roles: superAdministrators, section: 'Administration' },
  { label: 'Tableau de bord institutionnel', path: '/app/institution/tableau-de-bord', roles: institutions, section: 'Observatoire' },
  { label: 'Skills-Gap institutionnel', path: '/app/institution/skills-gap', roles: institutions, section: 'Observatoire' },
  { label: 'Carte territoriale', path: '/app/institution/carte', roles: institutions, section: 'Observatoire' },
  { label: 'Publication des opportunités', path: '/app/super-admin/opportunites', roles: superAdministrators, section: 'Publication' },
  { label: 'Utilisateurs', path: '/app/super-admin/utilisateurs', roles: superAdministrators, section: 'Super administration' },
];

export function workspaceLabel(role: UserRole | undefined): string {
  switch (role) {
    case UserRole.ORGANISATION:
      return 'Espace Organisation';
    case UserRole.CENTRE_ADMIN:
      return 'Espace gestionnaire de centre';
    case UserRole.ADMIN:
      return 'Administration';
    case UserRole.SUPER_ADMIN:
      return 'Super administration';
    case UserRole.INSTITUTION:
      return 'Espace institutionnel';
    default:
      return 'Espace professionnel';
  }
}
