import { Injectable, inject } from '@angular/core';
import { map, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { Notification } from '../../shared/models';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  lister() {
    const utilisateurId = this.auth.getCurrentUser()?.id;
    if (!utilisateurId) {
      return throwError(() => new Error('Utilisateur connecté introuvable.'));
    }
    return this.api
      .get<Array<Notification & { destinataireId?: string; dateReception?: string }>>(
        `/api/notifications/utilisateur/${utilisateurId}`,
      )
      .pipe(
        map((items) =>
          items.map((item) => ({
            ...item,
            id: item.destinataireId ?? item.id,
            dateCreation: item.dateReception ?? item.dateCreation,
          })),
        ),
      );
  }

  marquerCommeLue(id: string) {
    return this.api.patch<Notification>(`/api/notifications/${id}/marquer-lue`, {});
  }
}
