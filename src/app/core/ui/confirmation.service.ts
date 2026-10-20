import { Injectable, signal } from '@angular/core';

export interface ConfirmationRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputRequired?: boolean;
  inputMaxLength?: number;
}

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  readonly request = signal<ConfirmationRequest | null>(null);
  private resolveCurrent: ((confirmed: boolean, value?: string) => void) | null = null;

  confirm(message: string, options: Partial<ConfirmationRequest> = {}): Promise<boolean> {
    this.closePrevious();
    this.request.set(this.buildRequest(message, options));
    return new Promise<boolean>((resolve) => { this.resolveCurrent = (confirmed) => resolve(confirmed); });
  }

  askText(message: string, options: Partial<ConfirmationRequest> = {}): Promise<string | null> {
    this.closePrevious();
    this.request.set(this.buildRequest(message, { ...options, inputLabel: options.inputLabel ?? 'Motif' }));
    return new Promise<string | null>((resolve) => {
      this.resolveCurrent = (confirmed, value) => resolve(confirmed ? (value ?? '') : null);
    });
  }

  close(confirmed: boolean, value?: string): void {
    const resolve = this.resolveCurrent;
    this.resolveCurrent = null;
    this.request.set(null);
    resolve?.(confirmed, value);
  }

  private closePrevious(): void {
    if (this.resolveCurrent) this.close(false);
  }

  private buildRequest(message: string, options: Partial<ConfirmationRequest>): ConfirmationRequest {
    return {
      title: options.title ?? 'Confirmer cette action',
      message,
      confirmLabel: options.confirmLabel ?? 'Confirmer',
      cancelLabel: options.cancelLabel ?? 'Annuler',
      danger: options.danger ?? false,
      inputLabel: options.inputLabel,
      inputPlaceholder: options.inputPlaceholder,
      inputRequired: options.inputRequired,
      inputMaxLength: options.inputMaxLength,
    };
  }
}
