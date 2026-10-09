import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  identifier = signal('');
  password = signal('');
  loading = signal(false);
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
        this.error.set(e?.error?.message ?? 'Connexion impossible. Vérifiez vos identifiants.');
      },
    });
  }
}