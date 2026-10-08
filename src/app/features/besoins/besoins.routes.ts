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
    path: ':id/edit',
    loadComponent: () =>
      import('../organisation/besoin-edit.component').then((m) => m.BesoinEditComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('../organisation/besoin-detail.component').then((m) => m.BesoinDetailComponent),
  },
];
