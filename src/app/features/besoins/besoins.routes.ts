import { Routes } from '@angular/router';
export const BESOINS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./besoins-page.component').then((m) => m.BesoinsPageComponent),
  },
  {
    path: 'nouveau',
    loadComponent: () => import('./besoin-form.component').then((m) => m.BesoinFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./besoin-detail-page.component').then((m) => m.BesoinDetailPageComponent),
  },
];
