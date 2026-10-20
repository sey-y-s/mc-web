import { Injectable, inject } from '@angular/core';
import { map, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Notification } from '../../shared/models';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  lister() { return this.fetch(false); }
  listerNonLues() { return this.fetch(true); }
  private fetch(unreadOnly: boolean) {
    const utilisateurId = this.auth.getCurrentUser()?.id;
    if (!utilisateurId) return throwError(() => new Error('Utilisateur connecté introuvable.'));
    const path = `/api/notifications/utilisateur/${utilisateurId}${unreadOnly ? '/non-lues' : ''}`;
    return this.api.get<Array<Notification & { dateReception?: string; dateLecture?: string }>>(path).pipe(
      map((items) => (items ?? []).map((item) => ({ ...item, dateCreation: item.dateReception ?? item.dateCreation }))),
    );
  }
  marquerCommeLue(id: string) { return this.api.patch<Notification>(`/api/notifications/${id}/marquer-lue`, {}); }
}
