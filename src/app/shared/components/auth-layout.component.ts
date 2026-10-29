import { Component, input } from '@angular/core';

/** Cadre commun des pages de connexion, d'inscription et de vérification. */
@Component({
  selector: 'mc-auth-layout',
  standalone: true,
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  /** Formulaire large (inscription en plusieurs étapes). */
  readonly large = input(false);
}
