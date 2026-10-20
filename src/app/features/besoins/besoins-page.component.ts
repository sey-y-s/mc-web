import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent, StatusBadgeComponent } from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { Besoin } from '../../shared/models';

@Component({
  selector: 'app-besoins-page',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './besoins-page.component.html',
})
export class BesoinsPageComponent {
  private readonly service = inject(BesoinService);
  private readonly organisations = inject(OrganisationService);

  readonly query = signal('');
  readonly statut = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly besoinsResource = rxResource({
    stream: () => this.service.lister(),
    defaultValue: [] as Besoin[],
  });

  readonly organisationApprouvee = computed(() => {
    return this.orgResource.value()?.statut === 'APPROUVEE';
  });

  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const st = this.statut();
    const items = this.besoinsResource.value() ?? [];
    return items.filter(
      (b) =>
        (!st || b.statut === st) &&
        (!q ||
          b.titre.toLocaleLowerCase().includes(q) ||
          (b.description ?? '').toLocaleLowerCase().includes(q))
    );
  });

  readonly pageCount = computed(() => {
    return Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
  });

  readonly visible = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  errorMessage(): string {
    const err = this.besoinsResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? 'Impossible de charger les besoins depuis le serveur.';
  }

  resetPage(): void {
    this.page.set(1);
  }

  goPage(n: number): void {
    this.page.set(Math.max(1, Math.min(this.pageCount(), n)));
  }
}
