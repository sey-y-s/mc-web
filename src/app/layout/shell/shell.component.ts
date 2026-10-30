import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { ConfirmationDialogComponent } from '../../core/ui/confirmation-dialog.component';
import { PreferencesService } from '../../core/services/preferences.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    HeaderComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  readonly navigationOpen = signal(false);
  readonly sidebarCollapsed = signal(false);
  readonly sidebarHovered = signal(false);

  private readonly preferences = inject(PreferencesService);

  constructor() {
    // Charge les préférences utilisateur à l'ouverture de l'espace professionnel.
    void this.preferences.charger();
  }

  setSidebarHovered(hovered: boolean): void {
    this.sidebarHovered.set(hovered);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update((collapsed) => !collapsed);
    this.sidebarHovered.set(false);
  }

  toggleMobileNavigation(): void {
    this.navigationOpen.update((open) => !open);
  }

  closeMobileNavigation(): void {
    this.navigationOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeNavigationOnEscape(): void {
    this.closeMobileNavigation();
  }
}
