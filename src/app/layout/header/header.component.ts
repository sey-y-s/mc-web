import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { workspaceLabel } from '../../core/navigation/navigation.config';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly workspaceLabel = workspaceLabel;
  @Input() navigationOpen = false;
  @Output() readonly toggleNavigation = new EventEmitter<void>();
}
