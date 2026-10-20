import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';
import { MatchingService, MatchingResult } from '../../core/services/matching.service';
import { Besoin } from '../../shared/models';

@Component({
  selector: 'app-matching-page',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './matching-page.component.html',
})
export class MatchingPageComponent {
  private readonly besoinService = inject(BesoinService);
  private readonly matchingService = inject(MatchingService);

  readonly selectedBesoinId = signal('');
  readonly region = signal('');

  readonly besoinsResource = rxResource({
    stream: () => this.besoinService.lister(),
    defaultValue: [] as Besoin[],
  });

  readonly besoins = computed(() => this.besoinsResource.value() ?? []);

  readonly currentBesoinId = computed(() => {
    const selected = this.selectedBesoinId();
    if (selected) return selected;
    return this.besoins()[0]?.id ?? '';
  });

  readonly matchingResource = rxResource({
    params: () => this.currentBesoinId(),
    stream: ({ params: besoinId }) => {
      if (!besoinId) return of([] as MatchingResult[]);
      return this.matchingService.listerPourBesoin(besoinId);
    },
    defaultValue: [] as MatchingResult[],
  });

  readonly loading = computed(
    () => this.besoinsResource.isLoading() || this.matchingResource.isLoading()
  );

  readonly error = computed(() => {
    const bErr = this.besoinsResource.error() as { message?: string } | undefined;
    if (bErr) return bErr.message || 'Impossible de charger les besoins.';
    const mErr = this.matchingResource.error() as { message?: string } | undefined;
    if (mErr) return mErr.message || 'Impossible de charger les correspondances.';
    return '';
  });

  readonly resultats = computed(() => {
    const items = this.matchingResource.value() ?? [];
    const reg = this.region().trim().toLowerCase();
    if (!reg) return items;
    return items.filter((item) =>
      item.talent?.localisation?.toLowerCase().includes(reg)
    );
  });
}
