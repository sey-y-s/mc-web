import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { PageHeaderComponent, StatusBadgeComponent } from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';

@Component({
  selector: 'app-besoin-detail-page',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './besoin-detail-page.component.html',
})
export class BesoinDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly s = inject(BesoinService);

  readonly id = this.route.snapshot.paramMap.get('id');

  readonly besoinResource = rxResource({
    params: () => this.id,
    stream: ({ params }) => (params ? this.s.obtenir(params) : of(null)),
  });

  readonly besoin = computed(() => this.besoinResource.value());
  readonly error = computed(() => {
    if (!this.id) return 'Identifiant du besoin manquant.';
    const err = this.besoinResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? 'Impossible de charger le besoin.';
  });
}
