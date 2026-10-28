import { Injectable, signal } from '@angular/core';
import type { CanalVerification } from './auth.service';
import type { TypeDocument } from '../organisation/organisation-legal';

/**
 * Inscription en cours de vérification. Gardé en mémoire seulement (jamais dans le stockage du
 * navigateur) : les pièces à déposer attendent que la session soit ouverte par le code.
 */
export interface VerificationEnCours {
  identifiant: string;
  canaux: CanalVerification[];
  /** Vrai quand le code vient d'être envoyé à l'inscription ; faux depuis la connexion (on en redemande un). */
  codeDejaEnvoye: boolean;
  pieces?: [TypeDocument, File][];
}

@Injectable({ providedIn: 'root' })
export class VerificationState {
  readonly courante = signal<VerificationEnCours | null>(null);
}
