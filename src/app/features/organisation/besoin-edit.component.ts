import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { BesoinService, BesoinCreateRequest } from '../../core/services/besoin.service';
import { ZoneBesoinComponent } from './zone-besoin.component';
import { Besoin } from '../../shared/models';
import { OrganisationService } from '../../core/services/organisation.service';
import { ApiService } from '../../core/services/api.service';
import { Competence } from '../../shared/models';

@Component({
  selector: 'app-besoin-edit',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, RouterLink, ZoneBesoinComponent],
  templateUrl: './besoin-edit.component.html'
})
export class BesoinEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(BesoinService);
  private readonly organisations = inject(OrganisationService);
  private readonly api = inject(ApiService);
  // Application sans zone.js : après un chargement asynchrone, il faut demander le rafraîchissement de la vue.
  private readonly cdr = inject(ChangeDetectorRef);

  besoin: Besoin | null = null;
  loading = true;
  saving = false;
  error = '';
  message = '';
  titre = '';
  description = '';
  dateDebut = '';
  dateFin = '';
  readonly zoneRegionId = signal<string | null>(null);
  readonly zoneCommuneId = signal<string | null>(null);
  statut: 'BROUILLON' | 'OUVERT' = 'BROUILLON';
  organisationId = '';
  statutOrganisation = '';
  competences: Competence[] = [];
  lignes: Array<{ competenceId: string; niveau: 'DEBUTANT' | 'INTERMEDIAIRE' | 'EXPERT'; quantite: number }> = [];
  
  readonly aujourdHui = new Date().toISOString().slice(0, 10);

  // Utilisation de ngOnInit (plus propre qu'async dans le constructor)
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Identifiant du besoin manquant.';
      this.loading = false;
      return;
    }

    try {
      // 1. Chargement séquentiel et propre avec await / firstValueFrom
      this.besoin = await firstValueFrom(this.service.obtenir(id));
      
      this.titre = this.besoin.titre;
      this.description = this.besoin.description ?? '';
      this.dateDebut = this.besoin.dateDebut ?? '';
      this.dateFin = this.besoin.dateFin ?? '';
      this.zoneRegionId.set(this.besoin.regionId ?? null);
      this.zoneCommuneId.set(this.besoin.communeId ?? null);
      this.organisationId = this.besoin.organisationId ?? '';
      this.statut = this.besoin.statut === 'OUVERT' ? 'OUVERT' : 'BROUILLON';
      
      this.lignes = (this.besoin.competences ?? []).map(c => ({
        competenceId: c.competenceId,
        niveau: c.niveau,
        quantite: c.quantite
      }));
      
      if (!this.lignes.length) {
        this.lignes = [{ competenceId: '', niveau: 'INTERMEDIAIRE', quantite: 1 }];
      }

      // 2. Chargement de l'organisation et des compétences en parallèle ou séquentiellement
      const org = await firstValueFrom(this.organisations.obtenirPourUtilisateur());
      this.statutOrganisation = org.statut ?? '';

      const rows = await firstValueFrom(this.api.get<Competence[]>('/api/v1/competences'));
      this.competences = rows ?? [];

    } catch (e: any) {
      this.error = e.error?.message ?? e.message ?? 'Impossible de charger les données du formulaire.';
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  ajouter(): void {
    this.lignes = [...this.lignes, { competenceId: '', niveau: 'INTERMEDIAIRE', quantite: 1 }];
  }

  retirer(i: number): void {
    this.lignes = this.lignes.filter((_, index) => index !== i);
    if (!this.lignes.length) this.ajouter();
  }

  async enregistrer(): Promise<void> {
    if (!this.besoin || this.saving) return;
    if (!this.titre.trim()) {
      this.error = 'Le titre est obligatoire.';
      return;
    }
    if (this.dateDebut && this.dateFin && this.dateFin < this.dateDebut) {
      this.error = 'La date de fin doit être postérieure à la date de début.';
      return;
    }
    if (this.statut === 'OUVERT' && this.statutOrganisation !== 'APPROUVEE') {
      this.error = 'Seule une organisation validée peut publier un besoin.';
      return;
    }

    const selected = this.lignes.filter(l => l.competenceId);
    if (new Set(selected.map(l => l.competenceId)).size !== selected.length) {
      this.error = 'Chaque compétence ne peut apparaître qu’une seule fois.';
      return;
    }
    if (selected.some(l => !Number.isInteger(Number(l.quantite)) || l.quantite < 1)) {
      this.error = 'Les quantités doivent être des entiers positifs.';
      return;
    }

    const body: BesoinCreateRequest = {
      organisationId: this.organisationId,
      titre: this.titre.trim(),
      description: this.description.trim(),
      statut: this.statut,
      dateDebut: this.dateDebut || null,
      dateFin: this.dateFin || null,
      regionId: this.zoneRegionId(),
      communeId: this.zoneCommuneId(),
      competences: selected.map(l => ({
        competenceId: l.competenceId,
        niveauMinimum: l.niveau,
        quantite: Number(l.quantite)
      }))
    };

    this.saving = true;
    this.error = '';
    this.cdr.markForCheck();

    try {
      const saved = await firstValueFrom(this.service.modifier(this.besoin.id, body));
      await this.router.navigate(['/app/organisation/besoins', saved.id]);
    } catch (e: any) {
      this.error = e.error?.message ?? e.message ?? 'Impossible d’enregistrer les modifications.';
      this.saving = false;
      this.cdr.markForCheck();
    }
  }
}