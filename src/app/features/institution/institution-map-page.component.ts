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
    <section class="mc-card mb-5 p-5"><div class="grid gap-3 sm:grid-cols-2"><label class="text-sm">Compétence<select class="mc-input mt-1" name="competence" [ngModel]="competenceId()" (ngModelChange)="competenceId.set($event); charger()"><option value="">Choisir</option>@for (c of competences(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label><label class="text-sm">Mesure<select class="mc-input mt-1" name="mesure" [ngModel]="mesure()" (ngModelChange)="mesure.set($event)"><option value="ECART">Écart (offre − demande)</option><option value="OFFRE">Offre</option><option value="DEMANDE">Demande</option></select></label><p class="sm:col-span-2 text-xs opacity-70">La carte se met à jour dès le choix de la compétence ; les indicateurs sont calculés au moment de la consultation.@if (loading()) { <span role="status"> Calcul en cours…</span> }</p></div></section>
    <section class="mc-card mb-5 p-5"><h2 class="mc-section-heading">Carte géographique</h2><p class="mc-muted mb-3 mt-1">Les 19 régions et le district de Bamako sont dessinés depuis le GeoJSON local HDX/OCHA. Les indicateurs sont joints uniquement par code stable et les cellules protégées restent masquées.</p><app-mali-map [institutionItems]="items" [mesure]="mesure()" /></section>
    <section class="mc-card p-5"><h2 class="mc-section-heading">Indicateurs par territoire</h2>@if (!items.length) { <p class="mt-3 text-sm opacity-70">Choisissez une compétence pour consulter les données agrégées publiables.</p> } @else { <div class="mt-3 overflow-x-auto"><table class="table w-full"><thead><tr><th>Code stable</th><th>Région</th><th>Compétence</th><th>Calculé le</th><th>Mesure</th><th>Confidentialité</th></tr></thead><tbody>@for (row of items; track row.regionCode + row.competenceId) { <tr><td class="font-mono">{{ row.regionCode }}</td><td>{{ row.regionNom }}</td><td>{{ row.competenceNom }}</td><td>{{ row.periodeDebut }}</td><td>{{ valeur(row) }}</td><td>{{ row.statutConfidentialite }}</td></tr> }</tbody></table></div> }</section>
  `,
})
export class InstitutionMapPageComponent {
  private readonly service = inject(AdminService);

  readonly competenceId = signal('');
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
    this.actionError.set('');
    if (!this.competenceId()) { this.items = []; return; }
    this.loading.set(true);
    this.items = [];
    this.service
      .territoireIndicateurs(this.competenceId(), this.mesure())
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
