import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { UserRole } from './core/auth/user-role.enum';

const professional = [UserRole.ORGANISATION, UserRole.ADMIN, UserRole.SUPER_ADMIN];
const admins = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
const superAdmins = [UserRole.SUPER_ADMIN];

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '403',
    loadComponent: () =>
      import('./features/placeholder/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '',
    component: ShellComponent,
    // canActivate: [authGuard(professional)],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'organisation',
        // canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/organisation-page.component').then(
            (m) => m.OrganisationPageComponent,
          ),
      },
      {
        path: 'besoins',
        loadChildren: () =>
          import('./features/besoins/besoins.routes').then((m) => m.BESOINS_ROUTES),
      },
      {
        path: 'matching',
        loadComponent: () =>
          import('./features/matching/matching-page.component').then(
            (m) => m.MatchingPageComponent,
          ),
      },
      {
        path: 'recherche-talents',
        loadComponent: () =>
          import('./features/talents/talents-page.component').then((m) => m.TalentsPageComponent),
      },
      {
        path: 'suivi-talents',
        loadComponent: () =>
          import('./features/suivi/suivi-page.component').then((m) => m.SuiviPageComponent),
      },
      {
        path: 'mises-en-relation',
        loadComponent: () =>
          import('./features/mise-en-relation/mise-en-relation-page.component').then(
            (m) => m.MiseEnRelationPageComponent,
          ),
      },
      {
        path: 'validations',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/validations/validations-page.component').then(
            (m) => m.ValidationsPageComponent,
          ),
      },
      {
        path: 'tests-numeriques',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/tests-numeriques/tests-numeriques-page.component').then(
            (m) => m.TestsNumeriquesPageComponent,
          ),
      },
      {
        path: 'referentiel',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/referentiel/referentiel-page.component').then(
            (m) => m.ReferentielPageComponent,
          ),
      },
      {
        path: 'opportunites',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/opportunites/opportunites-page.component').then(
            (m) => m.OpportunitesPageComponent,
          ),
      },
      {
        path: 'skills-gap',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/skills-gap/skills-gap-page.component').then(
            (m) => m.SkillsGapPageComponent,
          ),
      },
      {
        path: 'institution',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/institution/institution-page.component').then(
            (m) => m.InstitutionPageComponent,
          ),
      },
      {
        path: 'citoyens',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/citoyens/citoyens-page.component').then(
            (m) => m.CitoyensPageComponent,
          ),
      },
      {
        path: 'audit/consultations',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/audit/audit-page.component').then((m) => m.AuditPageComponent),
      },
      {
        path: 'organisations',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/organisations/organisations-page.component').then(
            (m) => m.OrganisationsPageComponent,
          ),
      },
      {
        path: 'centres',
        // canActivate: [authGuard(admins)],
        loadComponent: () =>
          import('./features/centres/centres-page.component').then((m) => m.CentresPageComponent),
      },
      {
        path: 'administration/utilisateurs',
        // canActivate: [authGuard(superAdmins)],
        loadComponent: () =>
          import('./features/administration/administration-page.component').then(
            (m) => m.AdministrationPageComponent,
          ),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./features/notifications/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
      {
        path: 'profil',
        loadComponent: () =>
          import('./features/profil/profil-page.component').then((m) => m.ProfilPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
