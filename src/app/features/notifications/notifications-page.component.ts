import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../shared/models';
import { AuthService } from '../../core/auth/auth.service';
import { UserRole } from '../../core/auth/user-role.enum';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent {
  private readonly service = inject(NotificationService);
  private readonly auth = inject(AuthService);

  readonly filterUnread = signal(false);
  readonly actionError = signal('');
  readonly pending = new Set<string>();

  readonly notificationsResource = rxResource({
    stream: () => this.service.lister(),
    defaultValue: [] as Notification[],
  });

  readonly filtered = computed(() => {
    const list = this.notificationsResource.value() ?? [];
    return this.filterUnread() ? list.filter((n) => !n.lu) : list;
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.notificationsResource.error() as { message?: string } | undefined;
    return err?.message ?? 'Impossible de charger les notifications.';
  }

  marquerLue(notification: Notification): void {
    if (notification.lu || this.pending.has(notification.id)) return;
    this.pending.add(notification.id);
    this.actionError.set('');
    this.service.marquerCommeLue(notification.id).subscribe({
      next: () => {
        notification.lu = true;
        this.pending.delete(notification.id);
      },
      error: (e: { message?: string }) => {
        this.actionError.set(e.message || 'Impossible de marquer cette notification comme lue.');
        this.pending.delete(notification.id);
      },
    });
  }

  destination(type: string): string {
    if (this.auth.getCurrentUser()?.role !== UserRole.ORGANISATION) {
      return this.auth.getCurrentUser()?.role === UserRole.SUPER_ADMIN ||
        this.auth.getCurrentUser()?.role === UserRole.ADMIN
        ? '/app/admin/dashboard'
        : '/app/dashboard';
    }
    switch (type) {
      case 'MISE_EN_RELATION':
        return '/app/organisation/relations';
      case 'BESOIN_COMPETENCE':
        return '/app/organisation/besoins';
      case 'VALIDATION':
        return '/app/organisation/profil';
      case 'OPPORTUNITE':
        return '/opportunites';
      default:
        return '/app/organisation/tableau-de-bord';
    }
  }
}
