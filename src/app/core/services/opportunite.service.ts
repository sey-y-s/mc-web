import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Opportunite } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class OpportuniteService {
  private readonly api = inject(ApiService);

  lister() {
    return this.api.get<Opportunite[]>('/api/opportunites');
  }

  creer(body: Partial<Opportunite>) {
    return this.api.post<Opportunite>('/api/opportunites', body);
  }

  modifier(id: string, body: Partial<Opportunite>) {
    return this.api.put<Opportunite>(`/api/opportunites/${id}`, body);
  }

  publier(id: string) {
    return this.api.patch<Opportunite>(`/api/opportunites/${id}/publier`, {});
  }

  archiver(id: string) {
    return this.api.patch<Opportunite>(`/api/opportunites/${id}/archiver`, {});
  }
}
