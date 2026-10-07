import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components';
import { BesoinService } from '../../core/services/besoin.service';
import { Besoin } from '../../shared/models';

@Component({
  selector: 'app-besoin-edit',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './besoin-edit.component.html',
})
export class BesoinEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(BesoinService);

  besoin: Besoin = {
    id: '',
    titre: '',
    description: '',
    statut: 'OUVERT',
    dateCreation: new Date().toISOString(),
  };
  error = '';
  loading = true;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Identifiant du besoin manquant.';
      this.loading = false;
      return;
    }

    this.service.obtenir(id).subscribe({
      next: (item) => {
        this.besoin = item;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger ce besoin.';
        this.loading = false;
      },
    });
  }

  save(): void {
    this.service.modifier(this.besoin.id, this.besoin).subscribe({
      next: () => this.router.navigate(['/besoins']),
      error: (error: Error) => {
        this.error = error.message || 'La modification du besoin a échoué.';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/besoins']);
  }
}
