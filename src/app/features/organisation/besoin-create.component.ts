import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeaderComponent } from '../../shared/components';
import { BesoinCreateRequest, BesoinService } from '../../core/services/besoin.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { AuthService } from '../../core/auth/auth.service';
import { ApiService } from '../../core/services/api.service';
import { Competence, BesoinCompetence } from '../../shared/models';

@Component({
  selector: 'app-besoin-create',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './besoin-create.component.html',
})
export class BesoinCreateComponent implements OnInit {
  private readonly service = inject(BesoinService);
  private readonly organisationService = inject(OrganisationService);
  private readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  titre = '';
  description = '';
  competenceId = '';
  niveau: BesoinCompetence['niveau'] = 'INTERMEDIAIRE';
  quantite = 1;
  dateDebut = '';
  dateFin = '';
  organisationId = '';
  competences: Competence[] = [];
  loading = true;
  saving = false;
  error = '';

  ngOnInit(): void {
    if (!this.auth.getCurrentUser()?.id) {
      this.error = 'Compte connecté introuvable. Veuillez vous reconnecter.';
      this.loading = false;
      return;
    }

    this.organisationService.obtenirPourUtilisateur().subscribe({
      next: (organisation) => {
        this.organisationId = organisation.id;
        this.chargerCompetences();
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger l’organisation associée au compte.';
        this.loading = false;
      },
    });
  }

  private chargerCompetences(): void {
    this.api.get<Competence[]>('/competences').subscribe({
      next: (items) => {
        this.competences = items ?? [];
        this.loading = false;
      },
      error: (error: Error) => {
        this.error = error.message || 'Impossible de charger le référentiel des compétences.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (!this.organisationId || !this.titre.trim() || this.saving) return;

    const request: BesoinCreateRequest = {
      organisationId: this.organisationId,
      titre: this.titre.trim(),
      description: this.description.trim(),
      statut: 'OUVERT',
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null,
      competences: this.competenceId
        ? [{
            competenceId: this.competenceId,
            niveauMinimum: this.niveau,
            quantite: this.quantite,
          }]
        : [],
    };

    this.saving = true;
    this.error = '';
    this.service.creer(request).subscribe({
      next: () => this.router.navigate(['/besoins']),
      error: (error: Error) => {
        this.error = error.message || 'Impossible de créer le besoin.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/besoins']);
  }
}
