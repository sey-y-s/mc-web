import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmationDialogComponent } from '../../core/ui/confirmation-dialog.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent, ConfirmationDialogComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly navigationOpen = signal(false);

  toggleMobileNavigation(): void {
    this.navigationOpen.update((v) => !v);
  }

  closeMobileNavigation(): void {
    this.navigationOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeMobileNavigation();
  }
}
