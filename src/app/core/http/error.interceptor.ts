import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../ui/toast.service';

/** En-tête interne : une requête déjà rejouée après un renouvellement ne l'est jamais deux fois. */
const REJOUEE = 'X-Session-Renouvelee';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const toast = inject(ToastService);
  const isAuthCall = req.url.includes('/auth/');

  const signaler = (error: HttpErrorResponse) => {
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
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Accès expiré : on le renouvelle une fois, puis on rejoue la requête sans que l'utilisateur le voie.
      if (error.status === 401 && !isAuthCall && !req.headers.has(REJOUEE) && auth.hasRefreshToken()) {
        return auth.refresh().pipe(
          catchError((echec: HttpErrorResponse) => {
            // Refus du serveur : la session est terminée. Panne réseau : on ne déconnecte pas.
            if (echec.status === 0 || echec.status >= 500) return signaler(echec);
            return signaler(error);
          }),
          switchMap((jeton) =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${jeton}`, [REJOUEE]: '1' } })).pipe(
              catchError((e: HttpErrorResponse) => signaler(e)),
            ),
          ),
        );
      }
      return signaler(error);
    }),
  );
};
