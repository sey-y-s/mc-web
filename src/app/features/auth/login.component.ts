import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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

  identifier = signal('');
  password = signal('');
  loading = signal(false);
  error = signal('');

  submit(): void {
    this.error.set('');
    this.loading.set(true);

    this.auth.login({ 
      identifiant: this.identifier().trim(), 
      password: this.password() 
    }).subscribe({
      next: () => {
        console.log(this.identifier().trim(), "test");
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Connexion impossible. Vérifiez vos identifiants.');
      },
    });
  }
}