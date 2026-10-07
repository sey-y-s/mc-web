import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../shared/models';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent {
  private readonly service = inject(NotificationService);
  notifications: Notification[] = [];
  loading = true;
  error = '';
  readonly pending = new Set<string>();

  constructor() {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.service.lister().subscribe({
      next: (items) => {
        this.notifications = items;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les notifications.';
        this.loading = false;
      },
    });
  }

  marquerLue(notification: Notification): void {
    if (notification.lu || this.pending.has(notification.id)) return;
    this.pending.add(notification.id);
    this.service.marquerCommeLue(notification.id).subscribe({
      next: () => {
        notification.lu = true;
        this.pending.delete(notification.id);
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de marquer cette notification comme lue.';
        this.pending.delete(notification.id);
      },
    });
  }
}
