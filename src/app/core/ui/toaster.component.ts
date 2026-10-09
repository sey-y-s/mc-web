import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'mc-toaster',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast toast-end toast-bottom z-50" aria-live="polite">
      @for (t of toasts.toasts(); track t.id) {
        <div
          class="alert shadow-md"
          [class.alert-success]="t.kind === 'success'"
          [class.alert-error]="t.kind === 'error'"
          [class.alert-info]="t.kind === 'info'"
          [attr.role]="t.kind === 'error' ? 'alert' : 'status'"
        >
          <span>{{ t.message }}</span>
          <button type="button" class="btn btn-ghost btn-xs" aria-label="Fermer" (click)="toasts.dismiss(t.id)">✕</button>
        </div>
      }
    </div>
  `,
})
export class ToasterComponent {
  readonly toasts = inject(ToastService);
}