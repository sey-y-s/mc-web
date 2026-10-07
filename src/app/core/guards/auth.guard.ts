import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../auth/user-role.enum';

export function authGuard(allowedRoles?: UserRole[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated()) return router.createUrlTree(['/auth/login']);
    if (allowedRoles && !auth.hasRole(allowedRoles)) return router.createUrlTree(['/403']);
    return true;
  };
}
