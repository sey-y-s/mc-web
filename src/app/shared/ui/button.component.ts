import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'error';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'mc-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      (click)="onClick($event)"
      [ngClass]="[
        'btn transition-all duration-150',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
      ]"
    >
      @if (loading) {
        <span class="loading loading-spinner loading-xs"></span>
      }
      <ng-content></ng-content>
    </button>
  `,
})
export class McButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() fullWidth: boolean = false;
  @Output() btnClick = new EventEmitter<MouseEvent>();

  sizeClasses: Record<ButtonSize, string> = {
    sm: 'btn-sm text-xs',
    md: 'btn-md text-sm',
    lg: 'btn-lg text-base',
  };

  variantClasses: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    accent: 'btn-accent',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    error: 'btn-error text-white',
  };

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }
}
