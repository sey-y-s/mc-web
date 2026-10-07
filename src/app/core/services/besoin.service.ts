import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Besoin } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class BesoinService {
  private readonly api = inject(ApiService);
  lister() {
    return this.api.get<Besoin[]>('/besoins');
  }
  creer(body: unknown) {
    return this.api.post<Besoin>('/besoins', body);
  }
  modifier(id: string, body: unknown) {
    return this.api.put<Besoin>(`/besoins/${id}`, body);
  }
}
