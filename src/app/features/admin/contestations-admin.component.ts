import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, ContestationAdmin, StatutContestation } from '../../core/services/admin.service';

const CHAMPS: Record<string, string> = {
  nom: 'Nom', prenom: 'Prénom', sexe: 'Sexe', commune: 'Commune', telephone: 'Téléphone', email: 'E-mail',
  competence: 'Compétence', experience: 'Expérience', autre: 'Autre information',
};

/**
 * Contestations et demandes de correction des citoyens (consignes V1.2).
 * Une décision n'est jamais modifiée : accepter une contestation enregistre une NOUVELLE décision.
 */
@Component({
  selector: 'app-contestations-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, DatePipe],
  template: `
    <mc-page-header title="Contestations" description="Réexaminer les décisions contestées et les demandes de correction des citoyens." />
    <section class="mc-card p-5 sm:p-6">
      @if (erreur()) { <p class="mb-3 text-sm text-error" role="alert">{{ erreur() }}</p> }
      @if (message()) { <p class="mb-3 text-sm text-success" role="status">{{ message() }}</p> }
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="join" role="group" aria-label="Filtrer les contestations">
          <button class="btn join-item btn-sm" type="button" [class.btn-primary]="enCours()" (click)="enCours.set(true)">À traiter ({{ aTraiter() }})</button>
          <button class="btn join-item btn-sm" type="button" [class.btn-primary]="!enCours()" (click)="enCours.set(false)">Toutes</button>
        </div>
        <p class="text-xs text-base-content/60">L’historique des décisions est conservé : une correction crée une nouvelle décision.</p>
      </div>

      @if (resource.isLoading()) { <p class="py-8 text-sm" role="status">Chargement…</p> }
      @else if (!liste().length) { <p class="py-8 text-sm text-base-content/60">{{ enCours() ? 'Aucune contestation à traiter.' : 'Aucune contestation.' }}</p> }
      @else {
        <ul class="mt-4 space-y-3">
          @for (c of liste(); track c.id) {
            <li class="rounded-lg border border-base-300 p-4">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <div class="min-w-0">
                  <p class="font-semibold">{{ titre(c) }}</p>
                  <p class="text-xs text-base-content/60">{{ c.citoyenNom }} · {{ c.dateCreation | date: 'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <span class="badge badge-sm mc-badge-lisible" [class.badge-warning]="c.statut === 'OUVERTE' || c.statut === 'EN_EXAMEN'" [class.badge-success]="c.statut === 'ACCEPTEE'" [class.badge-error]="c.statut === 'REJETEE'">{{ libelle(c.statut) }}</span>
              </div>
              <p class="mt-2 whitespace-pre-line text-sm">{{ c.motif }}</p>
              @if (c.reponse) { <p class="mt-2 text-sm"><span class="font-medium">Réponse :</span> {{ c.reponse }}</p> }

              @if (c.statut === 'OUVERTE' || c.statut === 'EN_EXAMEN') {
                @if (ouverte() === c.id) {
                  <div class="mt-3 grid gap-3 rounded-lg bg-base-200 p-3 mc-etape">
                    @if (c.typeObjet === 'DECISION_VALIDATION') {
                      <fieldset>
                        <legend class="mc-label">Si vous acceptez, nouvelle décision</legend>
                        <div class="mt-1 flex flex-wrap gap-4 text-sm">
                          <label class="flex cursor-pointer items-center gap-2"><input type="radio" class="radio radio-sm" name="nd-{{ c.id }}" value="APPROUVEE" [ngModel]="nouvelleDecision()" (ngModelChange)="nouvelleDecision.set($event)" /> Compétence validée</label>
                          <label class="flex cursor-pointer items-center gap-2"><input type="radio" class="radio radio-sm" name="nd-{{ c.id }}" value="REJETEE" [ngModel]="nouvelleDecision()" (ngModelChange)="nouvelleDecision.set($event)" /> Rejetée</label>
                        </div>
                      </fieldset>
                    }
                    <label class="text-sm">Réponse au citoyen
                      <textarea class="mc-input mt-1" rows="2" [ngModel]="reponse()" (ngModelChange)="reponse.set($event)" placeholder="Expliquez la décision (obligatoire pour un rejet)"></textarea>
                    </label>
                    <div class="flex flex-wrap gap-2">
                      <button class="btn btn-primary btn-sm" type="button" [disabled]="saving() || (c.typeObjet === 'DECISION_VALIDATION' && !nouvelleDecision())" (click)="traiter(c, 'ACCEPTEE')">Accepter</button>
                      <button class="btn btn-secondary btn-sm" type="button" [disabled]="saving() || !reponse().trim()" (click)="traiter(c, 'REJETEE')">Rejeter</button>
                      @if (c.statut === 'OUVERTE') { <button class="btn btn-ghost btn-sm" type="button" [disabled]="saving()" (click)="traiter(c, 'EN_EXAMEN')">Marquer « en examen »</button> }
                      <button class="btn btn-ghost btn-sm" type="button" (click)="ouverte.set(null)">Annuler</button>
                    </div>
                  </div>
                } @else {
                  <button class="btn btn-primary btn-sm mt-3" type="button" (click)="ouvrir(c)">Traiter</button>
                }
              }
            </li>
          }
        </ul>
      }
    </section>
  `,
})
export class ContestationsAdminComponent {
  private readonly service = inject(AdminService);

  readonly enCours = signal(true);
  readonly ouverte = signal<string | null>(null);
  readonly reponse = signal('');
  readonly nouvelleDecision = signal<'APPROUVEE' | 'REJETEE' | ''>('');
  readonly saving = signal(false);
  readonly message = signal('');
  readonly actionErreur = signal('');

  readonly resource = rxResource({ stream: () => this.service.contestations(false), defaultValue: [] as ContestationAdmin[] });
  readonly liste = computed(() => {
    const toutes = this.resource.value() ?? [];
    return this.enCours() ? toutes.filter((c) => c.statut === 'OUVERTE' || c.statut === 'EN_EXAMEN') : toutes;
  });
  readonly aTraiter = computed(() => (this.resource.value() ?? []).filter((c) => c.statut === 'OUVERTE' || c.statut === 'EN_EXAMEN').length);

  titre(c: ContestationAdmin): string {
    if (c.typeObjet === 'DECISION_VALIDATION') {
      const d = c.decisionContestee === 'APPROUVEE' ? 'validation' : c.decisionContestee === 'REJETEE' ? 'refus' : 'décision';
      return `Contestation d’un ${d} — ${c.competenceNom ?? 'compétence'}`;
    }
    if (c.typeObjet === 'DONNEE_PROFIL') return `Correction du profil — ${CHAMPS[c.champConcerne ?? ''] ?? c.champConcerne ?? ''}`;
    return c.champConcerne ? `Autre demande — ${c.champConcerne}` : 'Autre demande';
  }

  libelle(s: StatutContestation): string {
    return { OUVERTE: 'À traiter', EN_EXAMEN: 'En examen', ACCEPTEE: 'Acceptée', REJETEE: 'Rejetée' }[s];
  }

  erreur(): string {
    if (this.actionErreur()) return this.actionErreur();
    const e = this.resource.error() as { message?: string } | undefined;
    return e ? (e.message ?? 'Contestations indisponibles.') : '';
  }

  ouvrir(c: ContestationAdmin): void {
    this.ouverte.set(c.id);
    this.reponse.set('');
    this.nouvelleDecision.set('');
    this.message.set('');
  }

  traiter(c: ContestationAdmin, statut: StatutContestation): void {
    this.saving.set(true);
    this.actionErreur.set('');
    const nd = this.nouvelleDecision();
    this.service
      .traiterContestation(c.id, {
        statut,
        reponse: this.reponse().trim() || undefined,
        nouvelleDecision: statut === 'ACCEPTEE' && nd ? nd : undefined,
      })
      .subscribe({
        next: () => {
          this.message.set(statut === 'ACCEPTEE' ? 'Contestation acceptée : le citoyen est prévenu.' : statut === 'REJETEE' ? 'Contestation rejetée : le citoyen est prévenu.' : 'Contestation passée en examen.');
          this.saving.set(false);
          if (statut !== 'EN_EXAMEN') this.ouverte.set(null);
          this.resource.reload();
        },
        error: (e: Error) => {
          this.actionErreur.set(e.message || 'Traitement impossible.');
          this.saving.set(false);
        },
      });
  }
}
