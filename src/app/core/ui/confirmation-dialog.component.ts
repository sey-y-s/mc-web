import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { ConfirmationService } from './confirmation.service';

@Component({
  selector: 'mc-confirmation-dialog',
  standalone: true,
  template: `
    @if (confirmation.request(); as request) {
      <div class="modal modal-open modal-bottom sm:modal-middle z-[100]" role="presentation">
        <section class="modal-box max-w-md border border-base-300 bg-base-100 p-0" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message">
          <div class="border-b border-base-300 px-6 py-4">
            <h2 id="confirmation-title" class="text-lg font-semibold">{{ request.title }}</h2>
          </div>
          <p id="confirmation-message" class="px-6 pt-5 text-sm leading-6 text-base-content/80">{{ request.message }}</p>
          @if (request.inputLabel) {
            <div class="px-6 pb-5 pt-3"><label class="block text-sm font-medium">{{ request.inputLabel }}<textarea class="mc-input mt-1 min-h-24" [value]="inputValue()" (input)="inputValue.set($any($event.target).value)" [attr.maxlength]="request.inputMaxLength || null" [placeholder]="request.inputPlaceholder || ''" [required]="request.inputRequired || false"></textarea></label></div>
          }
          <div class="flex justify-end gap-2 border-t border-base-300 bg-base-200/50 px-6 py-4">
            <button class="btn btn-ghost" type="button" (click)="confirmation.close(false)">{{ request.cancelLabel }}</button>
            <button class="btn" [class.btn-error]="request.danger" [class.btn-primary]="!request.danger" type="button" (click)="confirmation.close(true, inputValue())" [disabled]="request.inputRequired && !inputValue().trim()">{{ request.confirmLabel }}</button>
          </div>
        </section>
        <button class="modal-backdrop" type="button" aria-label="Annuler" (click)="confirmation.close(false)"></button>
      </div>
    }
  `,
})
export class ConfirmationDialogComponent {
  readonly confirmation = inject(ConfirmationService);
  readonly inputValue = signal('');
  constructor() { effect(() => { this.confirmation.request(); this.inputValue.set(''); }); }
  @HostListener('document:keydown.escape') closeOnEscape(): void {
    if (this.confirmation.request()) this.confirmation.close(false);
  }
}
