import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { API_CONFIG } from '../api/api.config';
import { looksLikePhone, normalizeMaliPhone } from '../utils/phone';
import { UserRole } from './user-role.enum';

export interface LoginRequest {
  identifiant: string;
  password: string;
}

export interface RegisterRequest {
  telephone: string;
  email?: string;
  password: string;
  role: 'ORGANISATION' | 'CITOYEN';

  // Compte organisation
  nomOrganisation?: string;
  descriptionOrganisation?: string;
  numeroRccm?: string;
  
  // Compte citoyen (inscription faite surtout sur mobile)
  nom?: string;
  prenom?: string;
  communeId?: string;
}

export interface LoginResponse {
  token: string;
}

export interface SessionUser {
  id: string;
  role: UserRole;
  exp?: number;
  actif?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'mc_access_token';
  private readonly userKey = 'mc_session_user';

  login(request: LoginRequest): Observable<LoginResponse> {
    const body: LoginRequest = { ...request, identifiant: this.normalizeIdentifier(request.identifiant) };
    return this.http
      .post<LoginResponse>(`${API_CONFIG.baseUrl}/auth/login`, body)
      .pipe(
        tap((response) => this.storeToken(response.token)),
        switchMap((response) => this.me().pipe(
          tap((profile) => {
            this.storeProfile(profile);
            if (!profile.actif) throw new Error('Ce compte est désactivé. Contactez un administrateur.');
          }),
          map(() => response),
        )),
        catchError((error) => {
          localStorage.removeItem(this.tokenKey);
          localStorage.removeItem(this.userKey);
          return throwError(() => error);
        }),
      );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/register`, request);
  }

  me(): Observable<{ id: string; role: UserRole; actif: boolean }> {
    return this.http.get<{ id: string; role: UserRole; actif: boolean }>(`${API_CONFIG.baseUrl}/auth/me`);
  }

  /** @param expired true quand la session a expiré */
  logout(expired = false): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    void this.router.navigate(['/auth/login'], expired ? { queryParams: { session: 'expiree' } } : undefined);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): SessionUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const user = this.getCurrentUser();
    return !!user && user.actif !== false && (!user.exp || user.exp * 1000 > Date.now());
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.getCurrentUser()?.role;
    return !!role && roles.includes(role);
  }

  /** Page d'arrivée après connexion, selon le rôle. */
  homeRoute(): string {
    const role = this.getCurrentUser()?.role as string | undefined;
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/app/admin/tableau-de-bord';
    if (role === 'ORGANISATION') return '/app/organisation/dashboard';
    if (role === 'CENTRE_ADMIN') return '/app/centre-admin';
    if (role === 'INSTITUTION') return '/app/institution/tableau-de-bord';
    return '/app/dashboard';
  }

  private normalizeIdentifier(raw: string): string {
    const value = raw.trim();
    if (looksLikePhone(value)) return normalizeMaliPhone(value) ?? value;
    return value.toLowerCase();
  }

  private storeProfile(profile: { id: string; role: UserRole; actif: boolean }): void {
    const current = this.getCurrentUser();
    localStorage.setItem(this.userKey, JSON.stringify({ id: profile.id, role: profile.role, actif: profile.actif, exp: current?.exp }));
  }

  private storeToken(token: string): void {
    const payload = this.decodePayload(token);
    if (!payload?.sub || !payload.role) throw new Error('Le jeton reçu est invalide.');
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify({ id: payload.sub, role: payload.role, exp: payload.exp }));
  }

  private decodePayload(token: string): { sub?: string; role?: UserRole; exp?: number } | null {
    try {
      return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }
}