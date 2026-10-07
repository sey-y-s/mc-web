import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent, StatusBadgeComponent } from '../../shared/components';
import { SkillsGapService } from '../../core/services/skills-gap.service';
import { SkillsGap } from '../../shared/models';
import { AuthService } from '../../core/auth/auth.service';
import { MaliMapComponent } from './mali-map.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent, StatusBadgeComponent, MaliMapComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly skillsGap = inject(SkillsGapService);
  readonly auth = inject(AuthService);
  data: SkillsGap[] = [];
  loading = true;
  error = '';
  ngOnInit(): void {
    this.skillsGap.lister().subscribe({
      next: (d) => {
        this.data = d ?? [];
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'Les indicateurs ne sont pas encore disponibles.';
        this.loading = false;
      },
    });
  }
  get totalDemand() {
    return this.data.reduce((s, x) => s + x.demandeEstimee, 0);
  }
  get totalOffer() {
    return this.data.reduce((s, x) => s + x.offreDisponible, 0);
  }
  get totalGap() {
    return this.data.reduce((s, x) => s + x.ecart, 0);
  }
  top() {
    return [...this.data].sort((a, b) => b.ecart - a.ecart).slice(0, 5);
  }
  max() {
    return Math.max(1, ...this.data.map((x) => Math.max(x.demandeEstimee, x.offreDisponible)));
  }
}
