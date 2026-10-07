import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  PageHeaderComponent,
  EmptyStateComponent,
  LoadingComponent,
  StatusBadgeComponent,
} from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';
import { Besoin } from '../../shared/models';

@Component({
  selector: 'app-besoins-page',
  standalone: true,
  imports: [
    RouterLink,
    PageHeaderComponent,
    LoadingComponent,
    StatusBadgeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './besoins-page.component.html',
})
export class BesoinsPageComponent implements OnInit {
  private readonly service = inject(BesoinService);
  besoins: Besoin[] = [];
  loading = true;
  error = '';
  ngOnInit() {
    this.service.lister().subscribe({
      next: (x) => {
        this.besoins = x ?? [];
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'Les besoins ne sont pas encore exposés par le backend.';
        this.loading = false;
      },
    });
  }
}
