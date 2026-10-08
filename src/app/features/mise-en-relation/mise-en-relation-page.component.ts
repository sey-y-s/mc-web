import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { MiseEnRelationService } from '../../core/services/mise-en-relation.service';
import { DemandeMiseEnRelation } from '../../shared/models';

@Component({
  selector: 'app-mise-en-relation-page',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './mise-en-relation-page.component.html',
})
export class MiseEnRelationPageComponent {
  private readonly service = inject(MiseEnRelationService);
  demandes: DemandeMiseEnRelation[] = [];
  loading = true;
  error = '';

  constructor() {
    this.service.lister().subscribe({
      next: (items) => {
        this.demandes = items;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger les demandes de mise en relation.';
        this.loading = false;
      },
    });
  }

  get enAttente(): number {
    return this.demandes.filter((demande) => demande.statut === 'EN_ATTENTE').length;
  }

  get acceptees(): number {
    return this.demandes.filter((demande) => demande.statut === 'ACCEPTEE').length;
  }

  get refusees(): number {
    return this.demandes.filter((demande) => demande.statut === 'REFUSEE').length;
  }
}
