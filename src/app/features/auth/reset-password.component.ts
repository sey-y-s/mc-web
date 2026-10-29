import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PasswordRecoveryService } from '../../core/auth/password-recovery.service';
import { ToastService } from '../../core/ui/toast.service';
import { AuthLayoutComponent } from '../../shared/components/auth-layout.component';

const DELAI_RENVOI = 60;

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './reset-password.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnDestroy {
  private readonly recovery = inject(PasswordRecoveryService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly identifiant = signal<string>(
    (this.router.getCurrentNavigation()?.extras.state?.['identifiant'] as string | undefined) ?? '',
  );
  readonly code = signal('');
  readonly motDePasse = signal('');
  readonly confirmation = signal('');
  readonly afficher = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly info = signal('');
  readonly attente = signal(0);
  private minuteur?: ReturnType<typeof setInterval>;

  readonly longueurOk = computed(() => this.motDePasse().length >= 8 && this.motDePasse().length <= 100);
  readonly identiques = computed(() => this.motDePasse() === this.confirmation());
  readonly valide = computed(
    () => this.identifiant().trim().length >= 3 && this.code().trim().length >= 4 && this.longueurOk() && this.identiques(),
  );

  ngOnDestroy(): void {
    clearInterval(this.minuteur);
  }

  valider(): void {
    if (!this.valide() || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.recovery.reinitialiser(this.identifiant(), this.code(), this.motDePasse()).subscribe({
      next: () => {
        this.toast.success('Mot de passe modifié. Connectez-vous avec le nouveau.');
        void this.router.navigate(['/auth/login']);
      },
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(e.error?.message ?? 'Le code est invalide ou expiré. Vérifiez-le, ou demandez-en un nouveau.');
      },
    });
  }

  renvoyer(): void {
    if (this.attente() > 0 || this.identifiant().trim().length < 3) return;
    this.error.set('');
    this.recovery.demander(this.identifiant()).subscribe({
      next: () => {
        this.info.set('Un nouveau code vient d’être envoyé.');
        this.demarrerAttente();
      },
      error: (e: HttpErrorResponse) => {
        if (e.status === 429) this.demarrerAttente();
        else this.error.set(e.error?.message ?? 'Envoi impossible pour le moment.');
      },
    });
  }

  private demarrerAttente(): void {
    clearInterval(this.minuteur);
    this.attente.set(DELAI_RENVOI);
    this.minuteur = setInterval(() => {
      this.attente.update((s) => Math.max(0, s - 1));
      if (this.attente() === 0) clearInterval(this.minuteur);
    }, 1000);
  }
}
