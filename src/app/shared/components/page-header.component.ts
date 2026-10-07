import { Component, input } from '@angular/core';

@Component({
  selector: 'mc-page-header',
  standalone: true,
  templateUrl: './page-header.component.html',
})
export class PageHeaderComponent {
  title = input.required<string>();
  description = input<string>('');
  actionLabel = input<string>('');
}
