import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import {
  NAVIGATION_ITEMS,
  NavigationItem,
  workspaceLabel,
} from '../../core/navigation/navigation.config';

interface NavigationGroup {
  readonly title: string;
  readonly items: readonly NavigationItem[];
  readonly icon: string;
}

// Icônes SVG dans le style TailAdmin. Elles sont décoratives : les libellés
// restent présents pour l'accessibilité et la navigation au clavier.
const GROUP_ICONS: Readonly<Record<string, string>> = {
  Principal: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.75 3.75h6.5v6.5h-6.5zm10 0h6.5v6.5h-6.5zm-10 10h6.5v6.5h-6.5zm10 0h6.5v6.5h-6.5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  Organisation: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20.25V7.5l8-4 8 4v12.75M2.75 20.25h18.5M8 9.25h.01M12 9.25h.01M16 9.25h.01M8 13h.01M12 13h.01M16 13h.01M10 20.25v-4h4v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  Centre: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.75 20.25h16.5M5.5 20.25V6.5l6.5-3 6.5 3v13.75M9 8.5h.01M15 8.5h.01M9 12h.01M15 12h.01M10 20.25v-4.5h4v4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  Administration: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.25 20 6.5v5.25c0 4.4-3.05 7.55-8 9-4.95-1.45-8-4.6-8-9V6.5l8-3.25Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="m8.75 12 2.1 2.1 4.4-4.45" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  Observatoire: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 19.75V4.25M3.5 19.75h17M7.25 16v-4m4 4V7m4 9v-6m4 6V4.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  Référentiels: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 4.25h14a1.75 1.75 0 0 1 1.75 1.75v12A1.75 1.75 0 0 1 19 19.75H5A1.75 1.75 0 0 1 3.25 18V6A1.75 1.75 0 0 1 5 4.25Z" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 8h9m-9 4h9m-9 4h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  Publication: `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 3.75h14A1.25 1.25 0 0 1 20.25 5v14A1.25 1.25 0 0 1 19 20.25H5A1.25 1.25 0 0 1 3.75 19V5A1.25 1.25 0 0 1 5 3.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M7.5 8h9m-9 4h9m-9 4h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  'Super administration': `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.25 14.2 8l5.2.7-3.8 3.7.9 5.2-4.5-2.45-4.5 2.45.9-5.2-3.8-3.7 5.2-.7L12 3.25Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  @Input() collapsed = false;
  @Output() readonly navigateRequested = new EventEmitter<void>();
  @Output() readonly hoverChange = new EventEmitter<boolean>();

  readonly espace = workspaceLabel(this.auth.getCurrentUser()?.role);
  readonly openedGroup = signal<string | null>(null);

  readonly groups = computed<NavigationGroup[]>(() => {
    const visibleItems = NAVIGATION_ITEMS.filter((item) =>
      this.auth.hasRole([...item.roles]),
    );
    const sectionNames = Array.from(new Set<string>(visibleItems.map((item) => item.section))); 

    return sectionNames.map((title) => ({
      title,
      items: visibleItems.filter((item) => item.section === title),
      icon: GROUP_ICONS[title] ?? GROUP_ICONS['Administration'],
    }));
  });

  constructor() {
    this.openActiveGroup();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.openActiveGroup());
  }

  isActive(path: string): boolean {
    return this.router.isActive(path, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  groupIsActive(group: NavigationGroup): boolean {
    return group.items.some((item) => this.isActive(item.path));
  }

  toggleGroup(title: string): void {
    this.openedGroup.update((current) => current === title ? null : title);
  }

  onMouseEnter(): void {
    if (this.collapsed) this.hoverChange.emit(true);
  }

  onMouseLeave(): void {
    if (this.collapsed) this.hoverChange.emit(false);
  }

  onNavigate(): void {
    this.navigateRequested.emit();
  }

  private openActiveGroup(): void {
    const activeGroup = this.groups().find((group) => this.groupIsActive(group));
    this.openedGroup.set(activeGroup?.title ?? null);
  }
}
