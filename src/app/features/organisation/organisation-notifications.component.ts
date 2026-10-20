import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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

  readonly notificationsResource = rxResource({
    stream: () => this.service.lister(),
    defaultValue: [] as Notification[],
  });

  readonly items = computed(() => this.notificationsResource.value() ?? []);
  readonly loading = computed(() => this.notificationsResource.isLoading());
  readonly error = computed(() => {
    const err = this.notificationsResource.error() as { message?: string } | undefined;
    return err?.message ?? '';
  });
}
