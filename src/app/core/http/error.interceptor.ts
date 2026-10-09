import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../ui/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const isAuthCall = req.url.includes('/auth/');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (!isAuthCall) {
        if (error.status === 401) {
          auth.logout(true);
        } else if (error.status === 403) {
          toast.error("Vous n'avez pas accès à cette ressource.");
        } else if (error.status === 0) {
          toast.error('Connexion impossible. Vérifiez votre réseau.');
        } else if (error.status >= 500) {
          toast.error('Le service est momentanément indisponible. Réessayez plus tard.');
        }
      }
      return throwError(() => error);
    }),
  );
};