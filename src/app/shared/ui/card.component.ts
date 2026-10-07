import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mc-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="
        'card bg-base-100 border border-base-300 shadow-xs transition-all ' +
        (hoverable ? 'hover:shadow-md hover:border-base-300/80 cursor-pointer' : '')
      "
    >
      <div class="card-body p-5 space-y-2">
        @if (title) {
          <div class="flex items-center justify-between border-b border-base-200 pb-3 mb-2">
            <h3 class="card-title text-base font-bold text-base-content">{{ title }}</h3>
            <ng-content select="[card-action]"></ng-content>
          </div>
        }
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class McCardComponent {
  @Input() title?: string;
  @Input() hoverable: boolean = false;
}
