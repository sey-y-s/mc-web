import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BesoinService } from '../../core/services/besoin.service';
import { EmptyStateComponent, PageHeaderComponent } from '../../shared/components';
@Component({
  selector: 'app-besoin-form',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './besoin-form.component.html',
})
export class BesoinFormComponent {
  private readonly s = inject(BesoinService);
  private readonly r = inject(Router);
  titre = '';
  description = '';
  dateDebut = '';
  dateFin = '';
  loading = false;
  error = '';
  submit() {
    this.loading = true;
    this.s
      .creer({
        titre: this.titre,
        description: this.description,
        statut: 'BROUILLON',
        dateDebut: this.dateDebut || null,
        dateFin: this.dateFin || null,
      })
      .subscribe({
        next: () => void this.r.navigate(['/besoins']),
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.message ?? 'Impossible de créer le besoin.';
        },
      });
  }
}
