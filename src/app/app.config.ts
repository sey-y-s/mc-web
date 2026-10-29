// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { Directionality } from '@angular/cdk/bidi';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { LiveDirectionality } from './shared/services/live-directionality.service';

// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(routes),
//     { provide: Directionality, useClass: LiveDirectionality },
//   ],
// };



import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/http/jwt.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';
registerLocaleData(localeFr);

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    provideRouter(routes, withViewTransitions({ skipInitialTransition: true })),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
  ],
};
