import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
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
  @ViewChild('drawerToggle') private drawerToggle?: ElementRef<HTMLInputElement>;
  navigationOpen = false;

  toggleMobileNavigation(): void {
    this.navigationOpen = !this.navigationOpen;
    if (this.drawerToggle) this.drawerToggle.nativeElement.checked = this.navigationOpen;
  }

  closeMobileNavigation(): void {
    this.navigationOpen = false;
    if (this.drawerToggle) this.drawerToggle.nativeElement.checked = false;
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeMobileNavigation();
  }
}
