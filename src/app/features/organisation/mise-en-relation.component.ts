import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components';
import { MiseEnRelationService } from '../../core/services/mise-en-relation.service';
import { DemandeMiseEnRelation } from '../../shared/models';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-mise-en-relation',
  standalone: true,
  imports: [DatePipe, FormsModule, PageHeaderComponent],
  templateUrl: './mise-en-relation.component.html',
})
export class MiseEnRelationComponent {
  private readonly service = inject(MiseEnRelationService);
  private readonly auth = inject(AuthService);

  destinataireId = '';
  message = '';
  demandes: DemandeMiseEnRelation[] = [];
  loading = true;
  sending = false;
  error = '';
  success = '';

  constructor() {
    this.charger();
  }

  charger(): void {
    this.loading = true;
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

  send(): void {
    const demandeurId = this.auth.getCurrentUser()?.id;
    if (!demandeurId || !this.destinataireId.trim() || !this.message.trim()) {
      this.error = 'Le compte connecté, le talent et le message sont obligatoires.';
      return;
    }

    this.sending = true;
    this.error = '';
    this.success = '';
    this.service.creer({
      demandeurId,
      destinataireId: this.destinataireId.trim(),
      statut: 'EN_ATTENTE',
      message: this.message.trim(),
    }).subscribe({
      next: () => {
        this.destinataireId = '';
        this.message = '';
        this.success = 'La demande de mise en relation a été envoyée.';
        this.sending = false;
        this.charger();
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible d’envoyer la demande.';
        this.sending = false;
      },
    });
  }
}
