import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, InstitutionIndicateur } from '../../core/services/admin.service';

@Component({
  selector: 'app-institution-dashboard',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <mc-page-header title="Tableau de bord institutionnel" description="Vue nationale agrégée des besoins et de l’offre de compétences." />
    @if (errorMessage()) { <div class="alert alert-warning text-gray-100 mb-5" role="alert">{{ errorMessage() }}</div> }
    <section class="mc-card mb-5 p-5"><form class="grid gap-3 sm:grid-cols-3" (ngSubmit)="charger()"><label class="text-sm">Compétence<select class="mc-input mt-1" name="competenceId" [ngModel]="competenceId()" (ngModelChange)="competenceId.set($event)" required><option value="">Choisir</option>@for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label><label class="text-sm">Début du trimestre<input class="mc-input mt-1" type="date" name="debut" [ngModel]="debut()" (ngModelChange)="debut.set($event)" required /></label><label class="text-sm">Fin du trimestre<input class="mc-input mt-1" type="date" name="fin" [ngModel]="fin()" (ngModelChange)="fin.set($event)" required /></label><div class="sm:col-span-3"><button class="btn btn-primary" [disabled]="loading() || !competenceId() || !debut() || !fin()">{{ loading() ? 'Chargement…' : 'Actualiser les indicateurs' }}</button></div></form></section>
    @if (resultat()) { <section class="grid gap-4 sm:grid-cols-3"><article class="mc-card p-5"><p class="mc-stat-label">Cellules visibles</p><p class="mc-stat-value">{{ resultat()!.cellulesVisibles }}</p></article><article class="mc-card p-5"><p class="mc-stat-label">Cellules masquées</p><p class="mc-stat-value">{{ resultat()!.cellulesMasquees }}</p></article><article class="mc-card p-5"><p class="mc-stat-label">Tensions classées</p><p class="mc-stat-value">{{ resultat()!.competencesEnTension.length }}</p></article></section>
    <section class="mc-card mt-5 p-5"><h2 class="mc-section-heading">Tensions les plus élevées parmi les cellules publiables</h2>@if (!resultat()!.competencesEnTension.length) { <p class="mt-3 text-sm opacity-70">Aucune tension publiable pour ce trimestre.</p> } @else { <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Région</th><th>Compétence</th><th>Offre</th><th>Demande</th><th>Écart</th></tr></thead><tbody>@for (r of resultat()!.competencesEnTension; track r.regionCode + r.competenceId) { <tr><td>{{ r.regionNom }}</td><td>{{ r.competenceNom }}</td><td>{{ valeur(r.offre) }}</td><td>{{ valeur(r.demande) }}</td><td>{{ valeur(r.ecart) }}</td></tr> }</tbody></table></div> }</section> }
    <div class="mt-5 flex flex-wrap gap-3"><a class="btn btn-outline" routerLink="/app/institution/skills-gap">Explorer le Skills-Gap</a><a class="btn btn-outline" routerLink="/app/institution/carte">Voir la carte territoriale</a></div>
  `,
})
export class InstitutionDashboardComponent {
  private readonly service = inject(AdminService);

  readonly competenceId = signal('');
  readonly debut = signal('');
  readonly fin = signal('');
  readonly loading = signal(false);
  readonly actionError = signal('');
  readonly resultat = signal<{
    cellulesVisibles: number;
    cellulesMasquees: number;
    competencesEnTension: InstitutionIndicateur[];
  } | null>(null);

  readonly competencesResource = rxResource({
    stream: () => this.service.institutionCompetences(),
    defaultValue: [] as Array<{ id: string; nom: string }>,
  });

  readonly competences = computed(() => this.competencesResource.value() ?? []);

  valeur(v: number | null): string {
    return v == null ? 'Masqué' : String(v);
  }

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.competencesResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? '';
  }

  charger(): void {
    this.actionError.set('');
    this.resultat.set(null);
    this.loading.set(true);
    this.service
      .institutionDashboard(this.competenceId(), this.debut(), this.fin())
      .subscribe({
        next: (r) => {
          this.resultat.set(r);
          this.loading.set(false);
        },
        error: (e) => {
          this.actionError.set(
            e.error?.message ?? e.message ?? 'Impossible de charger le tableau de bord.'
          );
          this.loading.set(false);
        },
      });
  }
}
