import { Component, EventEmitter, Output, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { NAVIGATION_ITEMS, NavigationItem, workspaceLabel } from '../../core/navigation/navigation.config';

interface Groupe {
  readonly titre: string;
  readonly entrees: readonly NavigationItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  private readonly auth = inject(AuthService);
  @Output() readonly navigateRequested = new EventEmitter<void>();

  readonly espace = workspaceLabel(this.auth.getCurrentUser()?.role);

  /** Entrées visibles pour le rôle courant, regroupées par section (ordre d'apparition conservé). */
  readonly groupes = computed<Groupe[]>(() => {
    const visibles = NAVIGATION_ITEMS.filter((i) => this.auth.hasRole([...i.roles]));
    const titres = [...new Set(visibles.map((i) => i.section))];
    return titres.map((titre) => ({ titre, entrees: visibles.filter((i) => i.section === titre) }));
  });

  exact(item: NavigationItem): boolean {
    return ['/app/dashboard', '/app/organisation', '/app/admin/dashboard'].includes(item.path);
  }

  onNavigate(): void {
    this.navigateRequested.emit();
  }
}
