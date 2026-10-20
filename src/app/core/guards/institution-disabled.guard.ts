import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

/** Fail-closed until the backend defines INSTITUTION permissions and a privacy-safe aggregate-indicator contract. */
export const institutionDisabledGuard: CanActivateFn = () => inject(Router).createUrlTree(['/403']);
