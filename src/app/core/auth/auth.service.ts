import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { API_CONFIG } from '../api/api.config';
import { looksLikePhone, normalizeMaliPhone } from '../utils/phone';
import { UserRole } from './user-role.enum';
import type { OrganisationIdentite } from '../services/organisation.service';

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
  /** Identité juridique malienne (type, RCCM, NIF, récépissé, siège, responsable…). */
  organisation?: OrganisationIdentite;
  /** Acceptation explicite des conditions d'utilisation (exigée par le serveur). */
  conditionsAcceptees?: boolean;
  
  // Compte citoyen (inscription faite surtout sur mobile)
  nom?: string;
  prenom?: string;
  communeId?: string;
}

export interface LoginResponse {
  token: string;
  /** Jeton de renouvellement (usage unique) : prolonge la session sans ressaisir le mot de passe. */
  refreshToken?: string;
}

export type CanalVerification = 'TELEPHONE' | 'EMAIL';

/** Réponse d'inscription : le compte est créé mais bloqué tant qu'un contact n'est pas vérifié par code. */
export interface InscriptionResponse {
  utilisateurId: string;
  verificationRequise: boolean;
  canaux: CanalVerification[];
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
  private readonly refreshKey = 'mc_refresh_token';
  private readonly userKey = 'mc_session_user';
  /** Renouvellement en cours, partagé : le jeton est à usage unique, un seul appel doit partir. */
  private renouvellement$?: Observable<string>;

  login(request: LoginRequest): Observable<LoginResponse> {
    const body: LoginRequest = { ...request, identifiant: this.normalizeIdentifier(request.identifiant) };
    return this.http
      .post<LoginResponse>(`${API_CONFIG.baseUrl}/auth/login`, body)
      .pipe(
        tap((response) => this.storeToken(response.token, response.refreshToken)),
        switchMap((response) => this.me().pipe(
          tap((profile) => {
            this.storeProfile(profile);
            if (!profile.actif) throw new Error('Ce compte est désactivé. Contactez un administrateur.');
          }),
          map(() => response),
        )),
        catchError((error) => {
          this.clearSession();
          return throwError(() => error);
        }),
      );
  }

  register(request: RegisterRequest): Observable<InscriptionResponse> {
    return this.http.post<InscriptionResponse>(`${API_CONFIG.baseUrl}/auth/register`, request);
  }

  /** Vérifie le téléphone ou l'email avec le code reçu : le compte s'ouvre et la session démarre. */
  verifierOtp(identifiant: string, canal: CanalVerification, code: string): Observable<LoginResponse> {
    const body = { identifiant: this.normalizeIdentifier(identifiant), canal, code: code.trim() };
    return this.http.post<LoginResponse>(`${API_CONFIG.baseUrl}/auth/verify-otp`, body).pipe(
      tap((response) => this.storeToken(response.token, response.refreshToken)),
      switchMap((response) => this.me().pipe(
        tap((profile) => this.storeProfile(profile)),
        map(() => response),
      )),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
    );
  }

  /** Demande un nouveau code (le serveur impose une minute entre deux envois). */
  renvoyerOtp(identifiant: string, canal: CanalVerification): Observable<void> {
    return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/resend-otp`, {
      identifiant: this.normalizeIdentifier(identifiant),
      canal,
    });
  }

  me(): Observable<{ id: string; role: UserRole; actif: boolean }> {
    return this.http.get<{ id: string; role: UserRole; actif: boolean }>(`${API_CONFIG.baseUrl}/auth/me`);
  }

  /** @param expired true quand la session a expiré */
  logout(expired = false): void {
    const token = this.getToken();
    const refreshToken = localStorage.getItem(this.refreshKey);
    if ((token && !expired) || refreshToken) {
      // Le serveur invalide l'accès et coupe la chaîne de renouvellement : rien ne peut rouvrir la session.
      const headers = token && !expired ? { Authorization: `Bearer ${token}` } : undefined;
      this.http.post<void>(`${API_CONFIG.baseUrl}/auth/logout`, refreshToken ? { refreshToken } : {}, { headers })
        .subscribe({ error: () => undefined });
    }
    this.clearSession();
    void this.router.navigate(['/auth/login'], expired ? { queryParams: { session: 'expiree' } } : undefined);
  }

  /** Vrai si un jeton de renouvellement est conservé (la session peut être prolongée). */
  hasRefreshToken(): boolean {
    return !!localStorage.getItem(this.refreshKey);
  }

  /**
   * Obtient un nouvel accès avec le jeton de renouvellement. Les appels simultanés partagent un seul
   * renouvellement. Une erreur 400/401/403 signifie que la session est terminée ; une erreur réseau
   * (statut 0 ou 5xx) n'efface rien.
   */
  refresh(): Observable<string> {
    if (this.renouvellement$) return this.renouvellement$;
    const refreshToken = localStorage.getItem(this.refreshKey);
    if (!refreshToken) return throwError(() => new HttpErrorResponse({ status: 401 }));
    this.renouvellement$ = this.http
      .post<LoginResponse>(`${API_CONFIG.baseUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((response) => this.storeToken(response.token, response.refreshToken)),
        map((response) => response.token),
        finalize(() => { this.renouvellement$ = undefined; }),
        shareReplay(1),
      );
    return this.renouvellement$;
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
    // Accès expiré mais renouvelable : la session continue, le premier appel obtiendra un nouvel accès.
    return !!user && user.actif !== false && (!user.exp || user.exp * 1000 > Date.now() || this.hasRefreshToken());
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

  private storeToken(token: string, refreshToken?: string): void {
    const payload = this.decodePayload(token);
    if (!payload?.sub || !payload.role) throw new Error('Le jeton reçu est invalide.');
    localStorage.setItem(this.tokenKey, token);
    if (refreshToken) localStorage.setItem(this.refreshKey, refreshToken);
    // On conserve l'état « actif » déjà connu (renouvellement) ; la connexion le relit ensuite.
    const actuel = this.getCurrentUser();
    localStorage.setItem(this.userKey, JSON.stringify({ ...(actuel?.id === payload.sub ? actuel : {}), id: payload.sub, role: payload.role, exp: payload.exp }));
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    localStorage.removeItem(this.userKey);
  }

  private decodePayload(token: string): { sub?: string; role?: UserRole; exp?: number } | null {
    try {
      return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }
}