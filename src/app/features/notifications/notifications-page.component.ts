import { Component } from '@angular/core';
import { PageHeaderComponent, EmptyStateComponent } from '../../shared/components';
@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  templateUrl: './notifications-page.component.html',
})
export class NotificationsPageComponent {}
