import { Component, EventEmitter, Output, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NAVIGATION_ITEMS, NavigationItem } from '../../core/navigation/navigation.config';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  readonly auth = inject(AuthService);
  readonly items = NAVIGATION_ITEMS;
  @Output() readonly navigateRequested = new EventEmitter<void>();

  sections(): string[] {
    return [...new Set(this.items.filter((item) => this.visible(item)).map((item) => item.section))];
  }

  visible(item: NavigationItem): boolean {
    return this.auth.hasRole([...item.roles]);
  }

  bySection(section: string): NavigationItem[] {
    return this.items.filter((item) => item.section === section && this.visible(item));
  }

  onNavigate(): void {
    this.navigateRequested.emit();
  }
}
