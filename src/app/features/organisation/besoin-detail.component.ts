import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent, StatusBadgeComponent } from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';
import { Besoin } from '../../shared/models';

@Component({
  selector: 'app-besoin-detail',
  standalone: true,
  imports: [DatePipe, RouterLink, PageHeaderComponent, StatusBadgeComponent],
  templateUrl: './besoin-detail.component.html',
})
export class BesoinDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(BesoinService);

  besoin: Besoin | null = null;
  loading = true;
  error = '';
  private besoinId = '';

  ngOnInit(): void {
    this.besoinId = this.route.snapshot.paramMap.get('id') ?? '';
    this.charger();
  }

  charger(): void {
    if (!this.besoinId) {
      this.error = 'Identifiant du besoin manquant.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.besoin = null;
    this.service.obtenir(this.besoinId).subscribe({
      next: (besoin) => {
        this.besoin = besoin;
        this.loading = false;
      },
      error: (error) => {
        this.error =
          error?.error?.message ??
          'Impossible de charger ce besoin. Vérifiez votre connexion et réessayez.';
        this.loading = false;
      },
    });
  }
}
