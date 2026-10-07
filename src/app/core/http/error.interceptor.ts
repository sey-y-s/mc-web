import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error) => {
      if (error.status === 401) inject(AuthService).logout();
      if (error.status === 403) void inject(Router).navigate(['/403']);
      return throwError(() => error);
    }),
  );
