import { Routes } from '@angular/router';
import { ShellComponent } from './layout/shell/shell.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
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
    canActivate: [authGuard(professional)],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [authGuard(professional)],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'organisation',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/organisation-page.component').then(
            (m) => m.OrganisationPageComponent,
          ),
      },
      {
        path: 'organisation/dashboard',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/organisation-dashboard.component').then(
            (m) => m.OrganisationDashboardComponent,
          ),
      },
      {
        path: 'organisation/profile',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/organisation-profile.component').then(
            (m) => m.OrganisationProfileComponent,
          ),
      },
      {
        path: 'organisation/besoins/nouveau',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/besoin-create.component').then(
            (m) => m.BesoinCreateComponent,
          ),
      },
      {
        path: 'organisation/besoins/:id',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/besoin-detail.component').then(
            (m) => m.BesoinDetailComponent,
          ),
      },
      {
        path: 'organisation/besoins/:id/edit',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/besoin-edit.component').then(
            (m) => m.BesoinEditComponent,
          ),
      },
      {
        path: 'talents',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/talent-search.component').then(
            (m) => m.TalentSearchComponent,
          ),
      },
      {
        path: 'talents/:id',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/talent-detail.component').then(
            (m) => m.TalentDetailComponent,
          ),
      },
      {
        path: 'matching/:besoinId',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/talent-matching.component').then(
            (m) => m.TalentMatchingComponent,
          ),
      },
      {
        path: 'suivi-besoin-talent',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/suivi-besoin-talent.component').then(
            (m) => m.SuiviBesoinTalentComponent,
          ),
      },
      {
        path: 'mises-en-relation',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/mise-en-relation/mise-en-relation-page.component').then(
            (m) => m.MiseEnRelationPageComponent,
          ),
      },
      {
        path: 'mises-en-relation/gestion',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/mise-en-relation.component').then(
            (m) => m.MiseEnRelationComponent,
          ),
      },
      {
        path: 'notifications',
        canActivate: [authGuard(professional)],
        loadComponent: () =>
          import('./features/notifications/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
      {
        path: 'notifications/organisation',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/organisation/organisation-notifications.component').then(
            (m) => m.OrganisationNotificationsComponent,
          ),
      },
      {
        path: 'besoins',
        canActivate: [authGuard(professional)],
        loadChildren: () =>
          import('./features/besoins/besoins.routes').then((m) => m.BESOINS_ROUTES),
      },
      {
        path: 'matching',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/matching/matching-page.component').then(
            (m) => m.MatchingPageComponent,
          ),
      },
      {
        path: 'recherche-talents',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/talents/talents-page.component').then((m) => m.TalentsPageComponent),
      },
      {
        path: 'suivi-talents',
        canActivate: [authGuard([UserRole.ORGANISATION])],
        loadComponent: () =>
          import('./features/suivi/suivi-page.component').then((m) => m.SuiviPageComponent),
      },
      {
        path: 'validations',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/validations-admin.component').then(
            (m) => m.ValidationsAdminComponent,
          ),
      },
      {
        path: 'tests-numeriques',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/tests-numeriques-admin.component').then(
            (m) => m.TestsNumeriquesAdminComponent,
          ),
      },
      {
        path: 'referentiel',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/referentiel-admin.component').then(
            (m) => m.ReferentielAdminComponent,
          ),
      },
      {
        path: 'opportunites',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/opportunites-admin.component').then(
            (m) => m.OpportunitesAdminComponent,
          ),
      },
      {
        path: 'skills-gap',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/skills-gap-admin.component').then(
            (m) => m.SkillsGapAdminComponent,
          ),
      },
      {
        path: 'institution',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/institution/institution-page.component').then(
            (m) => m.InstitutionPageComponent,
          ),
      },
      {
        path: 'citoyens',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/citoyens-admin.component').then(
            (m) => m.CitoyensAdminComponent,
          ),
      },
      {
        path: 'audit/consultations',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/audit/audit-page.component').then((m) => m.AuditPageComponent),
      },
      {
        path: 'organisations',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/organisations-admin.component').then(
            (m) => m.OrganisationsAdminComponent,
          ),
      },
      {
        path: 'centres',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/centres-admin.component').then((m) => m.CentresAdminComponent),
      },
      {
        path: 'admin/dashboard',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'admin/citoyens',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/citoyens-admin.component').then(
            (m) => m.CitoyensAdminComponent,
          ),
      },
      {
        path: 'admin/organisations',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/organisations-admin.component').then(
            (m) => m.OrganisationsAdminComponent,
          ),
      },
      {
        path: 'admin/centres',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/centres-admin.component').then(
            (m) => m.CentresAdminComponent,
          ),
      },
      {
        path: 'admin/validations',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/validations-admin.component').then(
            (m) => m.ValidationsAdminComponent,
          ),
      },
      {
        path: 'admin/tests-numeriques',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/tests-numeriques-admin.component').then(
            (m) => m.TestsNumeriquesAdminComponent,
          ),
      },
      {
        path: 'admin/referentiel',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/referentiel-admin.component').then(
            (m) => m.ReferentielAdminComponent,
          ),
      },
      {
        path: 'admin/opportunites',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/opportunites-admin.component').then(
            (m) => m.OpportunitesAdminComponent,
          ),
      },
      {
        path: 'admin/skills-gap',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/skills-gap-admin.component').then(
            (m) => m.SkillsGapAdminComponent,
          ),
      },
      {
        path: 'admin/audit',
        canActivate: [roleGuard(admins)],
        loadComponent: () =>
          import('./features/admin/audit-admin.component').then((m) => m.AuditAdminComponent),
      },
      {
        path: 'administration/utilisateurs',
        canActivate: [roleGuard(superAdmins)],
        loadComponent: () =>
          import('./features/super-admin/users-admin.component').then(
            (m) => m.UsersAdminComponent,
          ),
      },
      {
        path: 'super-admin/utilisateurs',
        canActivate: [roleGuard(superAdmins)],
        loadComponent: () =>
          import('./features/super-admin/users-admin.component').then((m) => m.UsersAdminComponent),
      },
      {
        path: 'super-admin/parametres',
        canActivate: [roleGuard(superAdmins)],
        loadComponent: () =>
          import('./features/super-admin/platform-settings.component').then(
            (m) => m.PlatformSettingsComponent,
          ),
      },
      {
        path: 'super-admin/opportunites',
        canActivate: [roleGuard(superAdmins)],
        loadComponent: () =>
          import('./features/super-admin/opportunite-publication.component').then(
            (m) => m.OpportunitePublicationComponent,
          ),
      },
      {
        path: 'profil',
        canActivate: [authGuard(professional)],
        loadComponent: () =>
          import('./features/profil/profil-page.component').then((m) => m.ProfilPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'auth/login' },
];
