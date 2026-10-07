import { Component, inject } from '@angular/core';
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
  identifier = '';
  password = '';
  loading = false;
  error = '';
  submit(): void {
    this.error = '';
    this.loading = true;
    this.router.navigate(['/dashboard']);
    // this.auth.login({ identifier: this.identifier.trim(), password: this.password }).subscribe({
    //   next: () => {
    //     this.loading = false;
    //     void this.router.navigate(['/dashboard']);
    //   },
    //   error: (e) => {
    //     this.loading = false;
    //     this.error = e?.error?.message ?? 'Connexion impossible. Vérifiez vos identifiants.';
    //   },
    // });
  }
}
