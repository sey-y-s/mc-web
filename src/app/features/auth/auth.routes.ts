import { Routes } from '@angular/router';
export const AUTH_ROUTES: Routes = [
  { path: 'login', title: 'Connexion — MaliCompétences', loadComponent: () => import('./login.component').then((m) => m.LoginComponent) },
  {
    path: 'register',
    title: 'Créer un compte — MaliCompétences',
    loadComponent: () => import('./register.component').then((m) => m.RegisterComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
