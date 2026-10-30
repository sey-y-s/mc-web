import { Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { workspaceLabel, NAVIGATION_ITEMS } from '../../core/navigation/navigation.config';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../shared/models';
import { ConfirmationService } from '../../core/ui/confirmation.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [NgClass, RouterLink],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);
  readonly workspaceLabel = workspaceLabel;
  @Input() navigationOpen = false;
  @Input() sidebarCollapsed = false;
  @Output() readonly toggleNavigation = new EventEmitter<void>();
  @Output() readonly toggleSidebar = new EventEmitter<void>();

  readonly searchQuery = signal('');
  readonly searchOpen = signal(false);
  readonly notificationOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly notifications = signal<Notification[]>([]);
  readonly unreadCount = computed(() => this.notifications().filter(item => !item.lu).length);
  readonly searchResults = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase('fr');
    if (!query) return [];
    return NAVIGATION_ITEMS
      .filter(item => this.auth.hasRole([...item.roles]))
      .filter(item => item.label.toLocaleLowerCase('fr').includes(query))
      .slice(0, 6);
  });

  constructor() {
    this.notificationService.lister().pipe(takeUntilDestroyed()).subscribe({
      next: items => this.notifications.set(items ?? []),
      error: () => this.notifications.set([]),
    });
  }

  get pageTitle(): string {
    let current = this.router.routerState.snapshot.root;
    while (current.firstChild) current = current.firstChild;
    return current.title?.toString() ?? this.workspaceLabel(this.auth.getCurrentUser()?.role);
  }

  get accountLabel(): string {
    return this.workspaceLabel(this.auth.getCurrentUser()?.role);
  }

  toggleSearch(): void {
    this.searchOpen.update(value => !value);
    this.notificationOpen.set(false);
    this.profileOpen.set(false);
    if (!this.searchOpen()) this.searchQuery.set('');
  }

  openSearch(): void { this.searchOpen.set(true); }
  closeSearch(): void { this.searchOpen.set(false); this.searchQuery.set(''); }
  toggleNotifications(): void { this.notificationOpen.update(value => !value); this.profileOpen.set(false); this.searchOpen.set(false); }
  toggleProfile(): void { this.profileOpen.update(value => !value); this.notificationOpen.set(false); this.searchOpen.set(false); }

  navigateTo(path: string): void {
    void this.router.navigateByUrl(path);
    this.closeSearch();
    this.notificationOpen.set(false);
    this.profileOpen.set(false);
  }

  destination(notification: Notification): string {
    const role = this.auth.getCurrentUser()?.role;
    if (role === 'ORGANISATION') return '/app/organisation/notifications';
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') return '/app/notifications';
    return '/app/notifications';
  }

  markAsRead(notification: Notification): void {
    if (notification.lu) return;
    this.notificationService.marquerCommeLue(notification.id).subscribe({
      next: () => this.notifications.update(items => items.map(item => item.id === notification.id ? { ...item, lu: true } : item)),
    });
  }

  async logout(): Promise<void> {
    this.profileOpen.set(false);
    const confirmed = await this.confirmation.confirm(
      'Voulez-vous vraiment fermer votre session MaliCompétences ?',
      { title: 'Se déconnecter', confirmLabel: 'Se déconnecter', danger: true },
    );
    if (confirmed) this.auth.logout();
  }
}
