import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  telephone = '';
  email = '';
  password = '';
  confirmation = '';
  loading = false;
  error = '';
  success = '';
  submit(): void {
    this.error = '';
    if (this.password !== this.confirmation) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    this.loading = true;
    this.auth
      .register({
        telephone: this.telephone.trim(),
        email: this.email.trim() || undefined,
        password: this.password,
        role: 'ORGANISATION',
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = 'Compte créé. Vous pouvez maintenant vous connecter.';
          setTimeout(() => void this.router.navigate(['/auth/login']), 800);
        },
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.message ?? 'Création du compte impossible.';
        },
      });
  }
}
