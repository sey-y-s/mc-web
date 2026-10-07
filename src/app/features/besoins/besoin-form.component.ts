import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BesoinCreateRequest, BesoinService } from '../../core/services/besoin.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { AuthService } from '../../core/auth/auth.service';
import { EmptyStateComponent, PageHeaderComponent } from '../../shared/components';
@Component({
  selector: 'app-besoin-form',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './besoin-form.component.html',
})
export class BesoinFormComponent implements OnInit {
  private readonly s = inject(BesoinService);
  private readonly organisationService = inject(OrganisationService);
  private readonly auth = inject(AuthService);
  private readonly r = inject(Router);
  titre = '';
  description = '';
  dateDebut = '';
  dateFin = '';
  loading = true;
  error = '';

  private organisationId = '';

  get canSubmit(): boolean {
    return !this.loading && !!this.organisationId && !!this.titre.trim();
  }

  ngOnInit(): void {
    if (!this.auth.getCurrentUser()?.id) {
      this.error = 'Compte connecté introuvable. Veuillez vous reconnecter.';
      this.loading = false;
      return;
    }

    this.organisationService.obtenirPourUtilisateur().subscribe({
      next: (organisation) => {
        this.organisationId = organisation.id;
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger l’organisation associée au compte.';
        this.loading = false;
      },
    });
  }

  submit() {
    if (!this.organisationId || this.loading) return;
    this.loading = true;
    const request: BesoinCreateRequest = {
      organisationId: this.organisationId,
      titre: this.titre.trim(),
      description: this.description.trim(),
      statut: 'BROUILLON',
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null,
      competences: [],
    };
    this.s.creer(request).subscribe({
      next: () => void this.r.navigate(['/besoins']),
      error: (error: Error) => {
        this.loading = false;
        this.error = error.message || 'Impossible de créer le besoin.';
      },
    });
  }
}
