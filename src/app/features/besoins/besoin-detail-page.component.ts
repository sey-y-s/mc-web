import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent, StatusBadgeComponent } from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';
import { Besoin } from '../../shared/models';
@Component({
  selector: 'app-besoin-detail-page',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './besoin-detail-page.component.html',
})
export class BesoinDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly s = inject(BesoinService);
  besoin?: Besoin;
  error = '';
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.s
      .lister()
      .subscribe({
        next: (list) => (this.besoin = list.find((x) => x.id === id)),
        error: (e) => (this.error = e?.error?.message ?? 'Impossible de charger le besoin.'),
      });
  }
}
