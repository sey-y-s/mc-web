import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG } from '../api/api.config';

export type ApiQueryParams = Record<
  string,
  string | number | boolean | readonly (string | number | boolean)[]
>;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  private url(path: string): string {
    return path.startsWith('/api/') ? path : `${API_CONFIG.baseUrl}${path}`;
  }

  get<T>(path: string, options?: { params?: ApiQueryParams | HttpParams }) {
    return this.http.get<T>(this.url(path), options);
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(this.url(path), body);
  }

  put<T>(path: string, body: unknown) {
    return this.http.put<T>(this.url(path), body);
  }

  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(this.url(path), body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.url(path));
  }
}
