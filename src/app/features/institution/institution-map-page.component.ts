import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, InstitutionIndicateur } from '../../core/services/admin.service';
import { MaliMapComponent } from '../dashboard/mali-map.component';

@Component({
  selector: 'app-institution-map-page',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, MaliMapComponent],
  template: `
    <mc-page-header title="Carte territoriale du Mali" description="Explorez les indicateurs Skills-Gap sur les 19 régions et le district de Bamako, à partir des limites locales HDX/OCHA." />
    @if (errorMessage()) { <div class="alert alert-warning text-gray-100 mb-5" role="alert">{{ errorMessage() }}</div> }
    <section class="mc-card mb-5 p-5"><form class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" (ngSubmit)="charger()"><label class="text-sm">Compétence<select class="mc-input mt-1" name="competence" [ngModel]="competenceId()" (ngModelChange)="competenceId.set($event)" required><option value="">Choisir</option>@for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label><label class="text-sm">Début du trimestre<input class="mc-input mt-1" type="date" name="debut" [ngModel]="debut()" (ngModelChange)="debut.set($event)" required /></label><label class="text-sm">Fin du trimestre<input class="mc-input mt-1" type="date" name="fin" [ngModel]="fin()" (ngModelChange)="fin.set($event)" required /></label><label class="text-sm">Mesure<select class="mc-input mt-1" name="mesure" [ngModel]="mesure()" (ngModelChange)="mesure.set($event)"><option value="ECART">Écart</option><option value="OFFRE">Offre</option><option value="DEMANDE">Demande</option></select></label><p class="sm:col-span-2 xl:col-span-4 text-xs opacity-70">La période doit correspondre à un trimestre civil complet (ex. 2026-01-01 au 2026-03-31).</p><div class="sm:col-span-2 xl:col-span-4"><button class="btn btn-primary" [disabled]="loading() || !competenceId() || !debut() || !fin() || !periodeTrimestreValide">{{ loading() ? 'Chargement…' : 'Charger les données territoriales' }}</button></div></form></section>
    <section class="mc-card mb-5 p-5"><h2 class="mc-section-heading">Carte géographique</h2><p class="mc-muted mb-3 mt-1">Les 19 régions et le district de Bamako sont dessinés depuis le GeoJSON local HDX/OCHA. Les indicateurs sont joints uniquement par code stable et les cellules protégées restent masquées.</p><app-mali-map [institutionItems]="items" [mesure]="mesure()" /></section>
    <section class="mc-card p-5"><h2 class="mc-section-heading">Indicateurs par territoire</h2>@if (!items.length) { <p class="mt-3 text-sm opacity-70">Choisissez une compétence et un trimestre pour consulter les données agrégées publiables.</p> } @else { <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Code stable</th><th>Région</th><th>Compétence</th><th>Période</th><th>Mesure</th><th>Confidentialité</th></tr></thead><tbody>@for (row of items; track row.regionCode + row.competenceId) { <tr><td class="font-mono">{{ row.regionCode }}</td><td>{{ row.regionNom }}</td><td>{{ row.competenceNom }}</td><td>{{ row.periodeDebut }} – {{ row.periodeFin }}</td><td>{{ valeur(row) }}</td><td>{{ row.statutConfidentialite }}</td></tr> }</tbody></table></div> }</section>
  `,
})
export class InstitutionMapPageComponent {
  private readonly service = inject(AdminService);

  readonly competenceId = signal('');
  readonly debut = signal('');
  readonly fin = signal('');
  readonly mesure = signal<'OFFRE' | 'DEMANDE' | 'ECART'>('ECART');
  readonly loading = signal(false);
  readonly actionError = signal('');
  items: InstitutionIndicateur[] = [];

  readonly competencesResource = rxResource({
    stream: () => this.service.institutionCompetences(),
    defaultValue: [] as Array<{ id: string; nom: string }>,
  });

  readonly competences = computed(() => this.competencesResource.value() ?? []);

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.competencesResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    return err?.error?.message ?? err?.message ?? '';
  }

  get periodeTrimestreValide(): boolean {
    if (!this.debut() || !this.fin()) return false;
    const debut = new Date(`${this.debut()}T00:00:00Z`);
    const fin = new Date(`${this.fin()}T00:00:00Z`);
    if (!Number.isFinite(debut.getTime()) || !Number.isFinite(fin.getTime())) return false;
    const mois = debut.getUTCMonth();
    if (debut.getUTCDate() !== 1 || mois % 3 !== 0) return false;
    const finTrimestre = new Date(Date.UTC(debut.getUTCFullYear(), mois + 3, 0));
    return fin.getTime() === finTrimestre.getTime();
  }

  valeur(r: InstitutionIndicateur): string {
    const v =
      this.mesure() === 'OFFRE' ? r.offre : this.mesure() === 'DEMANDE' ? r.demande : r.ecart;
    const privacy = (r.statutConfidentialite ?? '').toLocaleLowerCase('fr');
    const protectedCell =
      privacy.includes('masqu') ||
      privacy.includes('supprim') ||
      privacy.includes('confident') ||
      privacy.includes('non_autoris');
    return v==null||protectedCell?'Masqué':new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 2,
    }).format(v);
  }

  charger(): void {
    if (!this.periodeTrimestreValide) {
      this.actionError.set('Choisissez un trimestre civil complet (dates de début et de fin exactes).');
      return;
    }
    this.actionError.set('');
    this.loading.set(true);
    this.items = [];
    this.service
      .territoireIndicateurs(this.competenceId(), this.debut(), this.fin(), this.mesure())
      .subscribe({
        next: (r) => {
          this.items = r.items ?? [];
          this.loading.set(false);
        },
        error: (e) => {
          this.actionError.set(
            e.error?.message ?? e.message ?? 'Les indicateurs territoriaux sont indisponibles.'
          );
          this.loading.set(false);
        },
      });
  }
}
