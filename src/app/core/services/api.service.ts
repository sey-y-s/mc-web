import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_CONFIG } from '../api/api.config';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  get<T>(path: string) {
    return this.http.get<T>(`${API_CONFIG.baseUrl}${path}`);
  }
  post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${API_CONFIG.baseUrl}${path}`, body);
  }
  put<T>(path: string, body: unknown) {
    return this.http.put<T>(`${API_CONFIG.baseUrl}${path}`, body);
  }
  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(`${API_CONFIG.baseUrl}${path}`, body);
  }
  delete<T>(path: string) {
    return this.http.delete<T>(`${API_CONFIG.baseUrl}${path}`);
  }
}
