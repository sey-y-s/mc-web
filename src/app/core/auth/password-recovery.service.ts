import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../api/api.config';
import { looksLikePhone, normalizeMaliPhone } from '../utils/phone';

/** Récupération du compte (CA7) : POST /auth/forgot-password puis POST /auth/reset-password. */
@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private readonly http = inject(HttpClient);

  /** Demande l'envoi d'un code de réinitialisation. */
  demander(identifiant: string): Observable<void> {
    return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/forgot-password`, {
      identifiant: this.normaliser(identifiant),
    });
  }

  /** Choisit un nouveau mot de passe (8 à 100 caractères) avec le code reçu. */
  reinitialiser(identifiant: string, code: string, nouveauMotDePasse: string): Observable<void> {
    return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/reset-password`, {
      identifiant: this.normaliser(identifiant),
      code: code.trim(),
      nouveauMotDePasse,
    });
  }

  /** Même règle que AuthService.normalizeIdentifier : +223 pour un numéro, minuscules pour un e-mail. */
  private normaliser(brut: string): string {
    const valeur = brut.trim();
    if (looksLikePhone(valeur)) return normalizeMaliPhone(valeur) ?? valeur;
    return valeur.toLowerCase();
  }
}
