import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { BesoinCreateRequest, BesoinService } from '../../core/services/besoin.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { ApiService } from '../../core/services/api.service';
import { Competence, BesoinCompetence } from '../../shared/models';
import { ZoneBesoinComponent } from './zone-besoin.component';

interface CompetenceDraft {
  competenceId: string;
  niveau: BesoinCompetence['niveau'];
  quantite: number;
}

@Component({
  selector: 'app-besoin-create',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, ZoneBesoinComponent],
  templateUrl: './besoin-create.component.html',
})
export class BesoinCreateComponent {
  private readonly service = inject(BesoinService);
  private readonly organisations = inject(OrganisationService);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  titre = '';
  description = '';
  dateDebut = '';
  dateFin = '';
  lignes: CompetenceDraft[] = [this.nouvelleLigne()];
  /** Zone du besoin ; proposée par défaut à la commune de l'organisation. */
  readonly zoneRegionId = signal<string | null>(null);
  readonly zoneCommuneId = signal<string | null>(null);
  private zonePreremplie = false;
  saving = false;
  readonly submitError = signal('');
  readonly aujourdHui = new Date().toISOString().slice(0, 10);

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly referentielResource = rxResource({
    stream: () => this.api.get<Competence[]>('/api/v1/competences'),
    defaultValue: [] as Competence[],
  });

  private readonly preremplirZone = effect(() => {
    const org = this.orgResource.value() as { communeId?: string | null; regionId?: string | null } | undefined;
    if (!org || this.zonePreremplie) return;
    this.zonePreremplie = true;
    if (org.communeId && org.regionId) {
      this.zoneRegionId.set(org.regionId);
      this.zoneCommuneId.set(org.communeId);
    }
  });

  readonly organisationId = computed(() => this.orgResource.value()?.id ?? '');
  readonly statutOrganisation = computed(() => this.orgResource.value()?.statut);
  readonly referentiel = computed(() => this.referentielResource.value() ?? []);

  readonly loading = computed(
    () => this.orgResource.isLoading() || this.referentielResource.isLoading()
  );

  readonly peutPublier = computed(() => this.statutOrganisation() === 'APPROUVEE');

  readonly error = computed(() => {
    if (this.submitError()) return this.submitError();
    const orgErr = this.orgResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (orgErr)
      return (
        orgErr.error?.message ??
        orgErr.message ??
        'Impossible de vérifier le statut de validation de l’organisation.'
      );
    const refErr = this.referentielResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (refErr)
      return (
        refErr.error?.message ??
        refErr.message ??
        'Le référentiel des compétences est indisponible.'
      );
    return '';
  });

  nouvelleLigne(): CompetenceDraft {
    return { competenceId: '', niveau: 'INTERMEDIAIRE', quantite: 1 };
  }

  ajouterCompetence(): void {
    this.lignes = [...this.lignes, this.nouvelleLigne()];
  }

  retirerCompetence(index: number): void {
    if (this.lignes.length > 1) this.lignes = this.lignes.filter((_, i) => i !== index);
    else this.lignes = [this.nouvelleLigne()];
  }

  private valider(publier: boolean): string | null {
    if (!this.titre.trim()) return 'Le titre est obligatoire.';
    if (this.titre.trim().length > 150) return 'Le titre ne peut pas dépasser 150 caractères.';
    if (this.dateDebut && this.dateDebut < this.aujourdHui)
      return 'La date de début ne peut pas être passée lors de la publication.';
    if (this.dateDebut && this.dateFin && this.dateFin < this.dateDebut)
      return 'La date de fin doit être supérieure ou égale à la date de début.';
    const selected = this.lignes.filter((line) => line.competenceId.trim());
    if (publier && selected.length === 0)
      return 'Ajoutez au moins une compétence avant de publier.';
    if (
      selected.some(
        (line) => !Number.isInteger(Number(line.quantite)) || Number(line.quantite) < 1
      )
    )
      return 'Chaque quantité doit être un entier supérieur ou égal à 1.';
    if (new Set(selected.map((line) => line.competenceId)).size !== selected.length)
      return 'Une compétence ne peut apparaître qu’une seule fois.';
    if (publier && !this.peutPublier())
      return 'La publication est bloquée tant que l’organisation n’est pas validée.';
    const statut = this.statutOrganisation();
    if (!publier && statut !== 'EN_ATTENTE' && statut !== 'APPROUVEE')
      return 'Seules les organisations en attente ou validées peuvent préparer un besoin en brouillon.';
    return null;
  }

  enregistrer(statut: 'BROUILLON' | 'OUVERT'): void {
    if (this.saving) return;
    const publier = statut === 'OUVERT';
    const validation = this.valider(publier);
    if (validation) {
      this.submitError.set(validation);
      return;
    }
    const selected = this.lignes.filter((line) => line.competenceId.trim());
    const body: BesoinCreateRequest = {
      organisationId: this.organisationId(),
      titre: this.titre.trim(),
      description: this.description.trim(),
      statut,
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null,
      regionId: this.zoneRegionId(),
      communeId: this.zoneCommuneId(),
      competences: selected.map((line) => ({
        competenceId: line.competenceId,
        niveauMinimum: line.niveau,
        quantite: Number(line.quantite),
      })),
    };
    this.saving = true;
    this.submitError.set('');
    this.service.creer(body).subscribe({
      next: (item) => {
        void this.router.navigate(['/app/organisation/besoins', item.id]);
      },
      error: (e) => {
        this.submitError.set(
          e?.error?.message ?? e?.message ?? 'Impossible d’enregistrer ce besoin.'
        );
        this.saving = false;
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/app/organisation/besoins']);
  }
}
