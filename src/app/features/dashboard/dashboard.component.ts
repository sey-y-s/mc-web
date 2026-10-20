import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
export class DashboardComponent {
  private readonly skillsGap = inject(SkillsGapService);
  readonly auth = inject(AuthService);
  readonly dataResource = rxResource({ stream: () => this.skillsGap.lister() });
  get data(): SkillsGap[] { return this.dataResource.value() ?? []; }
  get loading(): boolean { return this.dataResource.isLoading(); }
  get error(): string {
    const err = this.dataResource.error() as { error?: { message?: string }; message?: string } | undefined;
    return err ? (err.error?.message ?? err.message ?? 'Les indicateurs sont momentanément indisponibles.') : '';
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
