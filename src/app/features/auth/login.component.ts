import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { VerificationState } from '../../core/auth/verification.state';
import { looksLikePhone } from '../../core/utils/phone';
import { AuthLayoutComponent } from '../../shared/components/auth-layout.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly verification = inject(VerificationState);

  identifier = signal('');
  password = signal('');
  loading = signal(false);
  showPassword = signal(false);
  error = signal(
    this.route.snapshot.queryParamMap.get('session') === 'expiree' ? 'Votre session a expiré. Reconnectez-vous.' : '',
  );

  submit(): void {
    this.error.set('');
    this.loading.set(true);
    this.auth.login({ identifiant: this.identifier(), password: this.password() }).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate([this.auth.homeRoute()]);
      },
      error: (e) => {
        this.loading.set(false);
        // Mot de passe correct mais compte pas encore vérifié : on ouvre l'écran du code.
        if (e?.status === 403 && e?.error?.code === 'COMPTE_NON_VERIFIE') {
          const identifiant = this.identifier().trim();
          this.verification.courante.set({
            identifiant,
            canaux: [looksLikePhone(identifiant) ? 'TELEPHONE' : 'EMAIL'],
            codeDejaEnvoye: false,
          });
          void this.router.navigate(['/auth/verification']);
          return;
        }
        this.error.set(e?.error?.message ?? 'Connexion impossible. Vérifiez vos identifiants.');
      },
    });
  }
}