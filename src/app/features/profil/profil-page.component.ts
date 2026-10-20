import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-profil-page',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './profil-page.component.html',
})
export class ProfilPageComponent {
  readonly auth = inject(AuthService);
  get user() { return this.auth.getCurrentUser(); }
}
