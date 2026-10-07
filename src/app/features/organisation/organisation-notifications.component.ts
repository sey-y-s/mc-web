import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../shared/models';

@Component({
  selector: 'app-organisation-notifications',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './organisation-notifications.component.html',
})
export class OrganisationNotificationsComponent {
  private readonly service = inject(NotificationService);
  items: Notification[] = [];
  error = '';
  loading = true;

  constructor() {
    this.service.lister().subscribe({
      next: (value) => {
        this.items = value ?? [];
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les notifications.';
        this.loading = false;
      },
    });
  }
}
