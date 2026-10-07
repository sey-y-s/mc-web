import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { MatchingService, MatchingResult } from '../../core/services/matching.service';
import { SuiviBesoinTalentService } from '../../core/services/suivi-besoin-talent.service';
import { MiseEnRelationService } from '../../core/services/mise-en-relation.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-talent-matching',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, RouterLink],
  templateUrl: './talent-matching.component.html',
})
export class TalentMatchingComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(MatchingService);
  private readonly suiviService = inject(SuiviBesoinTalentService);
  private readonly relationService = inject(MiseEnRelationService);
  private readonly auth = inject(AuthService);

  items: MatchingResult[] = [];
  loading = true;
  error = '';
  actionError = '';
  actionMessage = '';
  filter = '';
  minimumScore = 0;
  sortOrder: 'desc' | 'asc' = 'desc';
  readonly pendingActions = new Set<string>();
  readonly completedActions = new Set<string>();
  private besoinId = '';

  constructor() {
    this.besoinId = this.route.snapshot.paramMap.get('besoinId') ?? '';
    this.charger();
  }

  get resultatsFiltres(): MatchingResult[] {
    const query = this.filter.trim().toLocaleLowerCase();
    return this.items
      .filter((item) => item.score >= this.minimumScore)
      .filter((item) => {
        if (!query) return true;
        const talent = item.talent;
        const values = [
          talent?.pseudo,
          talent?.metierNom,
          talent?.localisation,
          ...(talent?.competences?.map((competence) => competence.nom) ?? []),
          ...(item.competencesCorrespondantes ?? []),
        ];
        return values.some((value) => value?.toLowerCase().includes(query));
      })
      .sort((left, right) =>
        this.sortOrder === 'desc' ? right.score - left.score : left.score - right.score,
      );
  }

  charger(): void {
    if (!this.besoinId) {
      this.error = 'Identifiant du besoin manquant dans l’adresse.';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = '';
    this.actionError = '';
    this.actionMessage = '';
    this.service.listerPourBesoin(this.besoinId).subscribe({
      next: (rows) => {
        this.items = rows ?? [];
        this.loading = false;
      },
      error: (error) => {
        this.error =
          error?.error?.message ??
          error?.message ??
          'Impossible de charger les correspondances. Réessayez ultérieurement.';
        this.loading = false;
      },
    });
  }

  suivre(item: MatchingResult): void {
    const organisationId = this.auth.getCurrentUser()?.id;
    if (!organisationId) {
      this.actionError = 'Compte connecté introuvable. Veuillez vous reconnecter.';
      return;
    }
    const actionKey = `suivi:${item.talentId}`;
    this.effectuerAction(actionKey, () =>
      this.suiviService.creer({
        organisationId,
        besoinId: this.besoinId,
        citoyenId: item.talentId,
        statut: 'A_L_ETUDE',
      }),
    );
  }

  demanderMiseEnRelation(item: MatchingResult): void {
    const demandeurId = this.auth.getCurrentUser()?.id;
    if (!demandeurId) {
      this.actionError = 'Compte connecté introuvable. Veuillez vous reconnecter.';
      return;
    }
    const actionKey = `relation:${item.talentId}`;
    this.effectuerAction(actionKey, () =>
      this.relationService.creer({
        demandeurId,
        destinataireId: item.talentId,
        statut: 'EN_ATTENTE',
        message: `Demande de mise en relation concernant le besoin ${this.besoinId}.`,
      }),
    );
  }

  private effectuerAction(
    actionKey: string,
    request: () => Observable<unknown>,
  ): void {
    if (this.pendingActions.has(actionKey) || this.completedActions.has(actionKey)) return;

    this.pendingActions.add(actionKey);
    this.actionError = '';
    this.actionMessage = '';
    request().subscribe({
      next: () => {
        this.pendingActions.delete(actionKey);
        this.completedActions.add(actionKey);
        this.actionMessage = 'Votre action a bien été enregistrée.';
      },
      error: (error: HttpErrorResponse) => {
        this.pendingActions.delete(actionKey);
        this.actionError =
          error.error?.message ??
          error.message ??
          'L’action a échoué. Aucune modification n’a été enregistrée.';
      },
    });
  }
}
