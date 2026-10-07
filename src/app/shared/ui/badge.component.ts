import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'neutral' | 'primary' | 'accent' | 'secondary' | 'error' | 'ghost';

@Component({
  selector: 'mc-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [ngClass]="['badge text-xs font-semibold uppercase tracking-wider', variantClasses[variant]]"
    >
      <ng-content></ng-content>
    </span>
  `,
})
export class McBadgeComponent {
  @Input() variant: BadgeVariant = 'neutral';

  variantClasses: Record<BadgeVariant, string> = {
    neutral: 'badge-neutral',
    primary: 'badge-primary',
    accent: 'badge-accent',
    secondary: 'badge-secondary',
    error: 'badge-error text-white',
    ghost: 'badge-ghost',
  };
}
