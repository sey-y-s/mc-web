import { HttpClient } from '@angular/common/http';
import { Injectable, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_CONFIG } from '../api/api.config';

interface PreferencesDto {
  lowDataMode?: boolean;
  notificationsEnabled?: boolean;
}

/**
 * Préférences de l'utilisateur (GET/PUT /utilisateurs/me/preferences).
 * « lowDataMode » (économie de données) pose data-eco="true" sur <html> : le CSS coupe alors animations et transitions.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_CONFIG.baseUrl}/utilisateurs/me/preferences`;

  readonly lowDataMode = signal(false);
  readonly notificationsEnabled = signal(true);

  constructor() {
    effect(() => document.documentElement.setAttribute('data-eco', String(this.lowDataMode())));
  }

  /** À appeler une fois la session ouverte. Un échec laisse les valeurs par défaut (aucun blocage). */
  async charger(): Promise<void> {
    try {
      const p = await firstValueFrom(this.http.get<PreferencesDto>(this.url));
      this.lowDataMode.set(p.lowDataMode ?? false);
      this.notificationsEnabled.set(p.notificationsEnabled ?? true);
    } catch {
      /* préférences indisponibles : on garde les valeurs par défaut */
    }
  }

  async modifier(changement: PreferencesDto): Promise<void> {
    const corps = {
      lowDataMode: changement.lowDataMode ?? this.lowDataMode(),
      notificationsEnabled: changement.notificationsEnabled ?? this.notificationsEnabled(),
    };
    const p = await firstValueFrom(this.http.put<PreferencesDto>(this.url, corps));
    this.lowDataMode.set(p.lowDataMode ?? corps.lowDataMode);
    this.notificationsEnabled.set(p.notificationsEnabled ?? corps.notificationsEnabled);
  }
}
