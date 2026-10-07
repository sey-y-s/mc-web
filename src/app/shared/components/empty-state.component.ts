import { Component, input } from '@angular/core';

@Component({
  selector: 'mc-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input<string>('Aucune donnée à afficher.');
}
