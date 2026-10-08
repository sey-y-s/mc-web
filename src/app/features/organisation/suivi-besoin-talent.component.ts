import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { SuiviBesoinTalentService } from '../../core/services/suivi-besoin-talent.service';
import { SuiviBesoinTalent } from '../../shared/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-suivi-besoin-talent',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './suivi-besoin-talent.component.html',
})
export class SuiviBesoinTalentComponent {
  private readonly service = inject(SuiviBesoinTalentService);
  private readonly auth = inject(AuthService);
  rows: SuiviBesoinTalent[] = [];
  error = '';
  readonly pending = new Set<string>();

  constructor() {
    this.service.lister().subscribe({
      next: (items) => {
        this.rows = items ?? [];
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger le suivi des talents.';
      },
    });
  }

  changerStatut(row: SuiviBesoinTalent, statut: SuiviBesoinTalent['statut']): void {
    if (statut === row.statut || this.pending.has(row.id)) return;
    const organisationId = this.auth.getCurrentUser()?.id;
    if (!organisationId) {
      this.error = 'Compte connecté introuvable. Veuillez vous reconnecter.';
      return;
    }
    const ancienStatut = row.statut;
    row.statut = statut;
    this.pending.add(row.id);
    this.error = '';
    this.service.mettreAJour(row.id, {
      organisationId,
      besoinId: row.besoinId,
      citoyenId: row.citoyenId,
      statut,
    }).subscribe({
      next: (updated) => {
        row.statut = updated.statut;
        this.pending.delete(row.id);
      },
      error: (error: Error) => {
        row.statut = ancienStatut;
        this.pending.delete(row.id);
        this.error = error.message || 'Impossible de modifier le statut du suivi.';
      },
    });
  }
}
