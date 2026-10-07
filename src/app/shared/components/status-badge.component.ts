import { Component, input } from '@angular/core';

@Component({
  selector: 'mc-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  value = input.required<string>();
}
