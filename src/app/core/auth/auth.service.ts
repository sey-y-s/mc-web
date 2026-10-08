import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../api/api.config';
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
}
export interface LoginResponse {
  token: string;
}
export interface SessionUser {
  id: string;
  role: UserRole;
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenKey = 'mc_access_token';
  private readonly userKey = 'mc_session_user';

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${API_CONFIG.baseUrl}/auth/login`, request)
      .pipe(tap((response) => this.storeToken(response.token)));
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${API_CONFIG.baseUrl}/auth/register`, request);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    void this.router.navigate(['/auth/login']);
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
    return !!user && (!user.exp || user.exp * 1000 > Date.now());
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.getCurrentUser()?.role;
    return !!role && roles.includes(role);
  }

  private storeToken(token: string): void {
    const payload = this.decodePayload(token);
    if (!payload?.sub || !payload.role) throw new Error('Le jeton reçu est invalide.');
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(
      this.userKey,
      JSON.stringify({ id: payload.sub, role: payload.role, exp: payload.exp }),
    );
  }

  private decodePayload(token: string): { sub?: string; role?: UserRole; exp?: number } | null {
    try {
      return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }
}
