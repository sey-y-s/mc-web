import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mc-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="modal modal-open modal-bottom sm:modal-middle z-50">
        <div
          class="modal-box bg-base-100 border border-base-300 p-0 overflow-hidden max-w-lg w-full"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-base-200">
            <h3 class="font-bold text-lg text-base-content">{{ title }}</h3>
            <button (click)="onClose()" class="btn btn-sm btn-circle btn-ghost">✕</button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          <div
            class="modal-action px-6 py-3 bg-base-200/50 border-t border-base-200 m-0 flex justify-end gap-2"
          >
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
        <!-- Backdrop -->
        <div class="modal-backdrop bg-neutral/40" (click)="onClose()"></div>
      </div>
    }
  `,
})
export class McModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = '';
  @Output() close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
