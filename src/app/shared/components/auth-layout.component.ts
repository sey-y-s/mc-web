import { Component, input } from '@angular/core';
import { StatusBadgeComponent } from './status-badge.component';

/** Cadre commun des pages de connexion, d'inscription et de vérification. */
@Component({
  selector: 'mc-auth-layout',
  standalone: true,
  imports: [StatusBadgeComponent],
  templateUrl: './auth-layout.component.html',
})
export class AuthLayoutComponent {
  /** Formulaire large (inscription en plusieurs étapes). */
  readonly large = input(false);
}
