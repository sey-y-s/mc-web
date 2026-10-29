import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswordRecoveryService } from '../../core/auth/password-recovery.service';
import { AuthLayoutComponent } from '../../shared/components/auth-layout.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './forgot-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly recovery = inject(PasswordRecoveryService);
  private readonly router = inject(Router);

  readonly identifiant = signal('');
  readonly loading = signal(false);
  readonly error = signal('');
  readonly valide = computed(() => this.identifiant().trim().length >= 3);

  envoyer(): void {
    if (!this.valide() || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.recovery.demander(this.identifiant()).subscribe({
      next: () => this.versReinitialisation(),
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        // 429 : un code vient déjà d'être envoyé. On passe à la saisie plutôt que de bloquer la personne.
        if (e.status === 429) this.versReinitialisation();
        else this.error.set(e.error?.message ?? 'Envoi impossible pour le moment. Réessayez dans un instant.');
      },
    });
  }

  private versReinitialisation(): void {
    this.loading.set(false);
    // L'identifiant voyage dans l'état de navigation, pas dans l'adresse (qui reste dans l'historique).
    void this.router.navigate(['/auth/reset-password'], { state: { identifiant: this.identifiant().trim() } });
  }
}
