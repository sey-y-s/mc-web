import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
export class MatchingPageComponent implements OnInit {
  private readonly besoinService = inject(BesoinService);
  private readonly matchingService = inject(MatchingService);

  besoins: Besoin[] = [];
  besoinId = '';
  region = '';
  resultats: MatchingResult[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.besoinService.lister().subscribe({
      next: (items) => {
        this.besoins = items ?? [];
        this.besoinId = this.besoins[0]?.id ?? '';
        this.rechercher();
      },
      error: () => {
        this.besoins = [];
      },
    });
  }

  rechercher(): void {
    if (!this.besoinId) return;
    this.loading = true;
    this.matchingService.listerPourBesoin(this.besoinId).subscribe({
      next: (items) => {
        this.resultats = items ?? [];
        this.loading = false;
      },
      error: (error: Error) => {
        this.resultats = [];
        this.error = error.message || 'Impossible de charger les correspondances.';
        this.loading = false;
      },
    });
  }
}
