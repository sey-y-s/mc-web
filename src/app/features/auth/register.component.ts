import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/ui/toast.service';
import { normalizeMaliPhone } from '../../core/utils/phone';
import { maliPhoneValidator, sameValue } from '../../shared/validators';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly form = this.fb.group(
    {
      nomOrganisation: ['', [Validators.required, Validators.maxLength(150)]],
      descriptionOrganisation: ['', [Validators.maxLength(500)]],
      telephone: ['', [Validators.required, maliPhoneValidator]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmation: ['', [Validators.required]],
    },
    { validators: sameValue('password', 'confirmation') },
  );

  readonly loading = signal(false);
  readonly error = signal('');

  /** Vrai si le champ a été touché et porte cette erreur. */
  invalid(name: string, error?: string): boolean {
    const control = this.form.get(name);
    if (!control || !control.touched) return false;
    return error ? control.hasError(error) : control.invalid;
  }

  get passwordsDiffer(): boolean {
    return this.form.hasError('mismatch') && !!this.form.get('confirmation')?.touched;
  }

  submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.loading.set(true);
    this.auth
      .register({
        role: 'ORGANISATION',
        nomOrganisation: v.nomOrganisation.trim(),
        descriptionOrganisation: v.descriptionOrganisation.trim() || undefined,
        telephone: normalizeMaliPhone(v.telephone) ?? v.telephone.trim(),
        email: v.email.trim().toLowerCase(),
        password: v.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.toast.success('Compte créé. Connectez-vous pour continuer.');
          void this.router.navigate(['/auth/login']);
        },
        error: (e: HttpErrorResponse) => {
          this.loading.set(false);
          this.error.set(e.status === 0 ? 'Connexion impossible. Vérifiez votre réseau.' : (e.error?.message ?? 'Création du compte impossible.'));
        },
      });
  }
}