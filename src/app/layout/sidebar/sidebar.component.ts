import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/auth/user-role.enum';

interface NavItem {
  label: string;
  path: string;
  roles: UserRole[];
  section: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  readonly items: NavItem[] = [
    {
      label: 'Tableau de bord',
      path: '/dashboard',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Principal',
    },
    {
      label: 'Mon organisation',
      path: '/organisation',
      roles: [UserRole.ORGANISATION],
      section: 'Organisation',
    },
    {
      label: 'Besoins',
      path: '/besoins',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Organisation',
    },
    {
      label: 'Talents',
      path: '/recherche-talents',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Organisation',
    },
    {
      label: 'Matching',
      path: '/matching',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Organisation',
    },
    {
      label: 'Suivi des talents',
      path: '/suivi-talents',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Organisation',
    },
    {
      label: 'Mises en relation',
      path: '/mises-en-relation',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Organisation',
    },
    {
      label: 'Validations',
      path: '/validations',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Plateforme',
    },
    {
      label: 'Tests numériques',
      path: '/tests-numeriques',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Plateforme',
    },
    {
      label: 'Référentiel',
      path: '/referentiel',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Plateforme',
    },
    {
      label: 'Opportunités',
      path: '/opportunites',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Plateforme',
    },
    {
      label: 'Skills-Gap',
      path: '/skills-gap',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Observatoire',
    },
    {
      label: 'Institutions',
      path: '/institution',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Observatoire',
    },
    {
      label: 'Citoyens',
      path: '/citoyens',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Administration',
    },
    {
      label: 'Audit',
      path: '/audit/consultations',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Administration',
    },
    {
      label: 'Organisations',
      path: '/organisations',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Administration',
    },
    {
      label: 'Centres',
      path: '/centres',
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Administration',
    },
    {
      label: 'Utilisateurs',
      path: '/administration/utilisateurs',
      roles: [UserRole.SUPER_ADMIN],
      section: 'Administration',
    },
    {
      label: 'Notifications',
      path: '/notifications',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Compte',
    },
    {
      label: 'Mon profil',
      path: '/profil',
      roles: [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN],
      section: 'Compte',
    },
  ];
  sections(): string[] {
    return [...new Set(this.items.filter((i) => this.visible(i)).map((i) => i.section))];
  }
  visible(item: NavItem): boolean {
    return this.auth.hasRole(item.roles);
  }
  bySection(section: string) {
    return this.items.filter((i) => i.section === section && this.visible(i));
  }
}
