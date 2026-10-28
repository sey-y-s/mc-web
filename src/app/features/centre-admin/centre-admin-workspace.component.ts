import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, CentreAdmin, EvaluateurCentreAdmin } from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';

@Component({
  selector: 'app-centre-admin-workspace',
  standalone: true,
  imports: [FormsModule, DatePipe, PageHeaderComponent],
  template: `
    <mc-page-header title="Mon centre" description="Gérez les évaluateurs et les affectations de votre centre." />
    @if (centreResource.isLoading()) { <section class="mc-card p-6" role="status">Chargement de votre centre…</section> }
    @else if (centreResource.error()) { <section class="mc-card p-6"><p class="text-sm text-error">Impossible de charger votre centre. Vérifiez que votre compte est bien affecté à un centre.</p><button class="btn btn-secondary mt-3" (click)="centreResource.reload()">Réessayer</button></section> }
    @else if (centreResource.value(); as centre) {
      <section class="mc-card mb-5 p-5 sm:p-6">
        <div class="flex flex-wrap items-start justify-between gap-4"><div><p class="text-xs font-semibold uppercase tracking-wide text-base-content/55">Centre de formation</p><h2 class="mt-1 text-2xl font-semibold">{{ centre.nom }}</h2><p class="mt-2 max-w-2xl text-sm text-base-content/70">{{ centre.description || 'Aucune description renseignée.' }}</p></div><span class="badge badge-outline">Espace gestionnaire</span></div>
        @if (agrementResource.value(); as ag) {
          <div class="mt-4 rounded-lg border border-base-300 p-3 text-sm">
            <p><span class="font-medium">Statut :</span> {{ ag.statut === 'ACTIF' ? 'Actif — le centre peut évaluer' : ag.statut === 'SUSPENDU' ? 'Suspendu — aucune évaluation possible' : 'En attente d’activation par l’administration' }}</p>
            <p class="mt-1"><span class="font-medium">Compétences agréées ({{ ag.competences.length }}) :</span> {{ ag.competences.length ? noms(ag.competences) : 'aucune pour le moment — contactez l’administration.' }}</p>
          </div>
        }
        <div class="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p><span class="text-base-content/55">Adresse</span><br>{{ centre.adresse || 'Non renseignée' }}</p><p><span class="text-base-content/55">Téléphone</span><br>{{ centre.telephone || 'Non renseigné' }}</p></div>
      </section>
      <section class="mc-card p-5 sm:p-6">
        <div class="mb-5"><h2 class="text-lg font-semibold">Évaluateurs</h2><p class="mt-1 text-sm text-base-content/65">Désignez des citoyens pour évaluer les compétences, puis suspendez temporairement leur accès si nécessaire.</p></div>
        @if (message()) { <p class="mb-4 text-sm text-success" role="status">{{ message() }}</p> }
        @if (error()) { <p class="mb-4 text-sm text-error" role="alert">{{ error() }}</p> }
        <form class="grid gap-3 rounded-lg border border-base-300 p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]" (ngSubmit)="designer()">
          <label class="block text-sm font-medium">Rechercher un citoyen<input class="mc-input mt-1" name="rechercheCitoyen" [ngModel]="rechercheCitoyen()" (ngModelChange)="rechercheCitoyen.set($event)" placeholder="Nom ou prénom" /></label>
          <label class="block text-sm font-medium">Citoyen à désigner<select class="mc-input mt-1" name="citoyenId" [(ngModel)]="citoyenId" required><option value="">Choisir un citoyen</option>@for (c of citoyensDisponibles(); track c.id) { <option [value]="c.id">{{ c.prenom }} {{ c.nom }}</option> }</select></label>
          <label class="block text-sm font-medium">Spécialité <span class="font-normal text-base-content/50">(facultatif)</span><input class="mc-input mt-1" name="specialite" [(ngModel)]="specialite" maxlength="200" placeholder="Ex. : installation solaire" /></label>
          <div class="flex items-end"><button class="btn btn-primary w-full" type="submit" [disabled]="saving() || !citoyenId">Désigner</button></div>
        </form>
        <div class="mt-5 flex flex-col gap-3 sm:flex-row"><input class="mc-input sm:max-w-sm" type="search" [ngModel]="recherche()" (ngModelChange)="recherche.set($event); page.set(1)" placeholder="Rechercher un évaluateur" aria-label="Rechercher un évaluateur" /><select class="mc-input sm:max-w-48" [ngModel]="filtre()" (ngModelChange)="filtre.set($event); page.set(1)" aria-label="Filtrer les évaluateurs"><option value="TOUS">Tous les statuts</option><option value="ACTIF">Actifs</option><option value="INACTIF">Suspendus</option></select></div>
        @if (evaluateursResource.isLoading()) { <p class="py-8 text-sm text-base-content/60" role="status">Chargement des évaluateurs…</p> }
        @else if (!evaluateursPage().length) { <p class="py-8 text-sm text-base-content/60">Aucun évaluateur ne correspond à la recherche.</p> }
        @else { <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Évaluateur</th><th>Spécialité</th><th>Désigné le</th><th>État</th><th></th></tr></thead><tbody>@for (e of evaluateursPage(); track e.id) { <tr><td class="font-medium">{{ e.prenomCitoyen }} {{ e.nomCitoyen }}</td><td>{{ e.specialite || '—' }}</td><td>{{ e.dateDesignation ? (e.dateDesignation | date:'dd/MM/yyyy') : '—' }}</td><td><span class="badge" [class.badge-success]="e.actif" [class.badge-ghost]="!e.actif">{{ e.actif ? 'Actif' : 'Suspendu' }}</span></td><td><div class="flex flex-wrap gap-2"><button class="btn btn-sm btn-primary" type="button" (click)="ouvrirHabilitation(e)">Habilitation</button><button class="btn btn-sm btn-secondary" type="button" [disabled]="saving()" (click)="changerActivation(e)">{{ e.actif ? 'Suspendre' : 'Réactiver' }}</button></div></td></tr> }</tbody></table></div><div class="mt-4 flex items-center justify-between gap-3 text-sm"><span>{{ evaluateursFiltres().length }} évaluateur(s) · Page {{ page() }} / {{ totalPages() }}</span><div class="flex gap-2"><button class="btn btn-sm btn-secondary" [disabled]="page() <= 1" (click)="page.set(page()-1)">Précédent</button><button class="btn btn-sm btn-secondary" [disabled]="page() >= totalPages()" (click)="page.set(page()+1)">Suivant</button></div></div> }
      </section>
      @if (habEvaluateur(); as he) {
        <section class="mc-card mt-5 p-5 sm:p-6 mc-etape" aria-labelledby="titre-hab">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div><h2 id="titre-hab" class="text-lg font-semibold">Habilitation — {{ he.prenomCitoyen }} {{ he.nomCitoyen }}</h2>
            <p class="mt-1 text-sm text-base-content/65">L’évaluateur ne décide que pour les compétences cochées (parmi celles agréées pour le centre) et jusqu’à la date de fin.</p></div>
            <button class="btn btn-ghost btn-sm" type="button" (click)="habEvaluateur.set(null)">Fermer</button>
          </div>
          <label class="mt-4 flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" class="checkbox checkbox-sm" [ngModel]="habToutes()" (ngModelChange)="habToutes.set($event)" />
            Toutes les compétences agréées du centre
          </label>
          @if (!habToutes()) {
            <div class="mt-3 grid max-h-72 gap-1 overflow-y-auto rounded-lg border border-base-300 p-3 sm:grid-cols-2 mc-etape">
              @for (c of agrementResource.value()?.competences ?? []; track c.id) {
                <label class="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm hover:bg-base-200">
                  <input type="checkbox" class="checkbox checkbox-sm" [checked]="habSelection().has(c.id)" (change)="basculerHab(c.id)" /> {{ c.nom }}
                </label>
              }
            </div>
          }
          <label class="mt-3 block max-w-xs text-sm">Fin de validité (facultatif)
            <input class="mc-input mt-1" type="date" [ngModel]="habDateFin()" (ngModelChange)="habDateFin.set($event)" />
          </label>
          <div class="mt-4 flex gap-2">
            <button class="btn btn-primary" type="button" (click)="enregistrerHabilitation()" [disabled]="saving() || (!habToutes() && !habSelection().size)">Enregistrer</button>
            <button class="btn btn-secondary" type="button" (click)="habEvaluateur.set(null)">Annuler</button>
          </div>
        </section>
      }
    }
  `,
})
export class CentreAdminWorkspaceComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);
  readonly centreResource = rxResource({ stream: () => this.service.centreAdminMonCentre() });
  readonly citoyensResource = rxResource({ stream: () => this.service.centreAdminCitoyens(), defaultValue: [] as Array<{id:string;nom:string;prenom:string}> });
  readonly evaluateursResource = rxResource({ stream: () => this.service.centreAdminEvaluateurs(), defaultValue: [] as EvaluateurCentreAdmin[] });
  citoyenId = '';
  specialite = '';
  readonly agrementResource = rxResource({
    params: () => this.centreResource.value()?.id,
    stream: ({ params }) => this.service.agrementCentre(params),
  });
  readonly habEvaluateur = signal<EvaluateurCentreAdmin | null>(null);
  readonly habToutes = signal(true);
  readonly habSelection = signal<Set<string>>(new Set());
  readonly habDateFin = signal('');

  noms(liste: Array<{ nom: string }>): string {
    const n = liste.map((c) => c.nom);
    return n.length > 6 ? `${n.slice(0, 6).join(', ')} et ${n.length - 6} autre(s)` : n.join(', ');
  }

  ouvrirHabilitation(e: EvaluateurCentreAdmin): void {
    this.habEvaluateur.set(e);
    this.error.set('');
    this.service.habilitation(e.centreId, e.citoyenId).subscribe({
      next: (h) => {
        this.habToutes.set(h.toutesCompetencesAgreees);
        this.habSelection.set(new Set(h.competences.map((c) => c.id)));
        this.habDateFin.set(h.dateFin ?? '');
      },
      error: (err: Error) => this.error.set(err.message || 'Habilitation indisponible.'),
    });
  }

  basculerHab(id: string): void {
    const s = new Set(this.habSelection());
    if (s.has(id)) s.delete(id); else s.add(id);
    this.habSelection.set(s);
  }

  enregistrerHabilitation(): void {
    const e = this.habEvaluateur();
    if (!e) return;
    this.saving.set(true);
    this.service.modifierHabilitation(e.centreId, e.citoyenId, {
      competenceIds: this.habToutes() ? [] : [...this.habSelection()],
      dateFin: this.habDateFin() || null,
    }).subscribe({
      next: () => { this.message.set('Habilitation enregistrée.'); this.saving.set(false); this.habEvaluateur.set(null); },
      error: (err: Error) => { this.error.set(err.message || 'Impossible d’enregistrer l’habilitation.'); this.saving.set(false); },
    });
  }
  readonly saving = signal(false);
  readonly message = signal('');
  readonly error = signal('');
  readonly recherche = signal('');
  readonly rechercheCitoyen = signal('');
  readonly filtre = signal('TOUS');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly evaluateursFiltres = computed(() => {
    const q = this.recherche().trim().toLocaleLowerCase();
    return (this.evaluateursResource.value() ?? []).filter(e => (this.filtre() === 'TOUS' || (this.filtre() === 'ACTIF' ? e.actif : !e.actif)) && (!q || `${e.nomCitoyen} ${e.prenomCitoyen} ${e.specialite ?? ''}`.toLocaleLowerCase().includes(q)));
  });
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.evaluateursFiltres().length / this.pageSize)));
  readonly evaluateursPage = computed(() => this.evaluateursFiltres().slice((Math.min(this.page(), this.totalPages())-1)*this.pageSize, Math.min(this.page(), this.totalPages())*this.pageSize));
  readonly citoyensDisponibles = computed(() => {
    const assigned = new Set((this.evaluateursResource.value() ?? []).map(e => e.citoyenId));
    const q = this.rechercheCitoyen().trim().toLocaleLowerCase();
    return (this.citoyensResource.value() ?? []).filter(c => !assigned.has(c.id) && (!q || `${c.nom} ${c.prenom}`.toLocaleLowerCase().includes(q)));
  });

  designer(): void {
    if (!this.citoyenId || this.saving()) return;
    this.saving.set(true); this.error.set(''); this.message.set('');
    this.service.centreAdminDesignerEvaluateur({ citoyenId: this.citoyenId, specialite: this.specialite.trim() || undefined }).subscribe({
      next: () => { this.message.set('Évaluateur désigné.'); this.citoyenId = ''; this.specialite = ''; this.saving.set(false); this.evaluateursResource.reload(); this.citoyensResource.reload(); },
      error: (e: Error) => { this.error.set(e.message || 'Impossible de désigner cet évaluateur.'); this.saving.set(false); },
    });
  }

  async changerActivation(e: EvaluateurCentreAdmin): Promise<void> {
    const actif = !e.actif;
    const ok = await this.confirmation.confirm(`${actif ? 'Réactiver' : 'Suspendre'} l’accès de ${e.prenomCitoyen} ${e.nomCitoyen} aux évaluations ?`, { title: 'Gestion des évaluateurs', confirmLabel: actif ? 'Réactiver' : 'Suspendre', danger: !actif });
    if (!ok || this.saving()) return;
    this.saving.set(true); this.error.set('');
    this.service.centreAdminModifierEvaluateur(e.citoyenId, actif).subscribe({
      next: () => { this.message.set(actif ? 'Évaluateur réactivé.' : 'Évaluateur suspendu.'); this.saving.set(false); this.evaluateursResource.reload(); },
      error: (err: Error) => { this.error.set(err.message || 'Impossible de modifier cet évaluateur.'); this.saving.set(false); },
    });
  }
}
