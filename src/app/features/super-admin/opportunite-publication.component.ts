import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, CategorieOpportunite } from '../../core/services/admin.service';
import {
  OpportuniteService,
  OpportuniteDetail,
  OpportuniteRequest,
  StatutOpportunite,
  TypeOpportunite,
} from '../../core/services/opportunite.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';
import { ApiService } from '../../core/services/api.service';
import { Candidature, StatutCandidature } from '../../core/services/opportunite.service';
import { catchError, of } from 'rxjs';

interface Option { id: string; nom: string; }

@Component({
  selector: 'app-opportunite-publication',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink, PageHeaderComponent],
  template: `
    <mc-page-header title="Publication des opportunités" description="Créez, publiez et suivez les opportunités, rattachées à une localité pour toucher en priorité ses habitants." />
    <section class="mc-card p-5 sm:p-6">
      @if (errorMessage()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }
      <div class="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div class="rounded-xl bg-slate-50 p-4"><p class="text-sm text-slate-600">Brouillons</p><p class="mt-2 text-2xl font-semibold">{{ count('BROUILLON') }}</p></div><div class="rounded-xl bg-slate-50 p-4"><p class="text-sm text-slate-600">Publiées</p><p class="mt-2 text-2xl font-semibold">{{ count('PUBLIEE') }}</p></div><div class="rounded-xl bg-slate-50 p-4"><p class="text-sm text-slate-600">Expirées</p><p class="mt-2 text-2xl font-semibold">{{ count('EXPIREE') }}</p></div><div class="rounded-xl bg-slate-50 p-4"><p class="text-sm text-slate-600">Archivées</p><p class="mt-2 text-2xl font-semibold">{{ count('ARCHIVEE') }}</p></div></div>
      <div class="mb-4 flex flex-wrap items-center gap-3"><input class="mc-input max-w-sm" type="search" [ngModel]="query()" (ngModelChange)="query.set($event)" placeholder="Rechercher une opportunité" aria-label="Rechercher une opportunité" /><select class="mc-input max-w-xs" [ngModel]="filter()" (ngModelChange)="filter.set($event)" aria-label="Filtrer par statut"><option value="">Tous les statuts</option>@for (s of statuses; track s) { <option [value]="s">{{ libelleStatut(s) }}</option> }</select><button class="btn btn-primary" (click)="nouveau()">Nouvelle opportunité</button><a class="btn btn-secondary" routerLink="/opportunites">Aperçu public</a></div>
      @if (opportunitesResource.isLoading()) { <p class="py-8 text-sm text-slate-500">Chargement des opportunités…</p> } @else if (!filtered().length) { <p class="py-8 text-sm text-slate-500">Aucune opportunité ne correspond aux filtres.</p> } @else { <div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Titre</th><th>Localité</th><th>Type</th><th>Statut</th><th>Expiration</th><th>Candidatures</th><th>Actions</th></tr></thead><tbody>@for (o of filtered(); track o.id) { <tr [class.bg-base-200]="candidaturesDe() === o.id"><td><div class="font-medium">{{ o.titre }}</div><div class="text-xs text-slate-500">{{ o.categorieNom || categoryName(o.categorieId) }}</div></td><td class="text-sm">{{ o.localite || 'Tout le Mali' }}</td><td class="text-sm">{{ libelleType(o.type) }}</td><td><span class="badge mc-badge-lisible badge-sm" [class.badge-success]="o.statut === 'PUBLIEE'" [class.badge-ghost]="o.statut !== 'PUBLIEE'">{{ libelleStatut(o.statut) }}</span></td><td class="text-sm">{{ o.dateExpiration ? (o.dateExpiration | date:'dd/MM/yyyy') : '—' }}</td><td><button class="btn btn-sm btn-ghost" type="button" (click)="voirCandidatures(o.id)">{{ o.nombreCandidatures ?? 0 }} · Voir</button></td><td><div class="flex flex-wrap gap-2"><button class="btn btn-sm btn-secondary" (click)="editer(o)">Modifier</button>@if (o.statut !== 'PUBLIEE') { <button class="btn btn-sm btn-secondary" (click)="changerStatut(o,'PUBLIEE')">Publier</button> }@if (o.statut !== 'ARCHIVEE') { <button class="btn btn-sm btn-secondary" (click)="changerStatut(o,'ARCHIVEE')">Archiver</button> }@if (o.statut === 'PUBLIEE') { <button class="btn btn-sm btn-secondary" (click)="changerStatut(o,'EXPIREE')">Marquer expirée</button> }</div></td></tr> }</tbody></table></div> }
      @if (candidaturesDe()) {
        <div class="mt-6 border-t border-slate-200 pt-5" aria-labelledby="titre-candidatures">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 id="titre-candidatures" class="text-lg font-semibold">Candidatures — {{ titreCandidatures() }}</h2>
            <button class="btn btn-sm btn-ghost" type="button" (click)="candidaturesDe.set(null)">Fermer</button>
          </div>
          <p class="mt-1 text-sm text-slate-500">Les habitants de la localité concernée sont présentés en premier. Les candidatures restent ouvertes à tous.</p>
          @if (candidaturesResource.isLoading()) { <p class="py-4 text-sm" role="status">Chargement des candidatures…</p> }
          @else if (!candidaturesResource.value().length) { <p class="py-4 text-sm text-slate-500">Aucune candidature pour le moment.</p> }
          @else {
            <ul class="mt-4 space-y-3">
              @for (c of candidaturesResource.value(); track c.id) {
                <li class="rounded-lg border border-base-300 p-4">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-semibold">{{ c.citoyenNom || 'Citoyen' }}
                        @if (c.locale) { <span class="badge mc-badge-lisible badge-success badge-sm ml-1">Habitant de la localité</span> }
                      </p>
                      <p class="text-sm text-slate-500">{{ c.communeNom ? c.communeNom + (c.regionNom ? ' (' + c.regionNom + ')' : '') : 'Localité non renseignée' }} · {{ c.nombreCompetences }} compétence(s), dont {{ c.nombreCompetencesValidees }} validée(s)</p>
                      @if (c.telephone) { <p class="text-sm">Contact : <a class="mc-link" [href]="'tel:' + c.telephone">{{ c.telephone }}</a></p> }
                      @if (c.message) { <p class="mt-2 whitespace-pre-wrap text-sm">« {{ c.message }} »</p> }
                      <p class="mt-1 text-xs text-slate-500">Reçue le {{ c.dateCandidature.slice(0, 10) }}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="badge mc-badge-lisible badge-sm" [class.badge-success]="c.statut === 'RETENUE'" [class.badge-error]="c.statut === 'NON_RETENUE'">{{ c.statut === 'RETENUE' ? 'Retenue' : c.statut === 'NON_RETENUE' ? 'Non retenue' : 'Reçue' }}</span>
                      <button class="btn btn-xs btn-secondary" type="button" [disabled]="c.statut === 'RETENUE'" (click)="statutCandidature(c.id, 'RETENUE')">Retenir</button>
                      <button class="btn btn-xs btn-secondary" type="button" [disabled]="c.statut === 'NON_RETENUE'" (click)="statutCandidature(c.id, 'NON_RETENUE')">Ne pas retenir</button>
                    </div>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      }
      @if (editing()) { <form class="mt-6 space-y-4 border-t border-slate-200 pt-5" (ngSubmit)="enregistrer()"><h2 class="text-lg font-semibold">{{ editId() ? 'Modifier l’opportunité' : 'Nouvelle opportunité' }}</h2><div class="grid gap-3 md:grid-cols-2"><label class="text-sm font-medium">Titre *<input class="mc-input mt-1" name="titre" [(ngModel)]="form.titre" maxlength="200" required /></label><label class="text-sm font-medium">Catégorie *<select class="mc-input mt-1" name="categorie" [(ngModel)]="form.categorieId" required><option value="">Sélectionner une catégorie</option>@for (c of categories(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label><label class="text-sm font-medium">Type *<select class="mc-input mt-1" name="type" [(ngModel)]="form.type">@for (t of types; track t) { <option [value]="t">{{ libelleType(t) }}</option> }</select></label><label class="text-sm font-medium">Statut *<select class="mc-input mt-1" name="statut" [(ngModel)]="form.statut">@for (s of statuses; track s) { <option [value]="s">{{ libelleStatut(s) }}</option> }</select></label><label class="text-sm font-medium">Date d’expiration<input class="mc-input mt-1" name="expiration" type="date" [(ngModel)]="form.dateExpiration" /></label><label class="text-sm font-medium">Région concernée<select class="mc-input mt-1" name="region" [ngModel]="formRegion()" (ngModelChange)="changerRegion($event)"><option value="">Tout le Mali</option>@for (r of regionsResource.value(); track r.id) { <option [value]="r.id">{{ r.nom }}</option> }</select></label><label class="text-sm font-medium">Commune concernée<select class="mc-input mt-1" name="commune" [(ngModel)]="form.communeId" [disabled]="!formRegion()"><option value="">{{ formRegion() ? 'Toute la région' : 'Choisissez d’abord une région' }}</option>@for (c of communesResource.value(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }</select></label><p class="text-xs text-slate-500 md:col-span-2">À la publication, les citoyens de la localité choisie reçoivent une alerte et passent en tête des candidatures. Tout le monde peut postuler.</p><label class="text-sm font-medium md:col-span-2">Description *<textarea class="mc-input mt-1" name="description" [(ngModel)]="form.description" rows="5" required></textarea></label></div><div class="rounded-xl bg-slate-50 p-4"><h3 class="font-semibold">Aperçu de la fiche publique</h3><p class="mt-2 text-lg font-semibold">{{ form.titre || 'Titre de l’opportunité' }}</p><p class="text-xs text-slate-500">{{ categoryName(form.categorieId) }} · {{ libelleType(form.type) }} · {{ libelleStatut(form.statut) }} · {{ localiteForm() }}</p><p class="mt-2 whitespace-pre-wrap text-sm">{{ form.description || 'La description apparaîtra ici.' }}</p></div><div class="flex flex-wrap gap-2"><button class="btn btn-primary" type="submit" [disabled]="saving()">{{ saving() ? 'Enregistrement…' : 'Enregistrer' }}</button><button class="btn btn-secondary" type="button" (click)="annuler()">Annuler</button></div></form> }
    </section>
    <section class="mc-card mt-5 p-5 sm:p-6"><h2 class="text-lg font-semibold">Catégories</h2><form class="mt-3 flex flex-col gap-3 sm:flex-row" (ngSubmit)="creerCategorie()"><input class="mc-input" name="nouvelleCategorie" [(ngModel)]="nouvelleCategorie" maxlength="150" placeholder="Nom de la catégorie" required /><button class="btn btn-secondary" type="submit" [disabled]="saving()">Ajouter une catégorie</button></form><div class="mt-3 flex flex-wrap gap-2">@for (c of categories(); track c.id) { <span class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">{{ c.nom }} <button class="font-semibold" type="button" [attr.aria-label]="'Supprimer la catégorie '+c.nom" (click)="supprimerCategorie(c)">×</button></span> }</div><p class="mt-3 text-xs text-slate-500">Une catégorie utilisée par une opportunité ne peut pas être supprimée.</p></section>
  `,
})
export class OpportunitePublicationComponent {
  private readonly service = inject(OpportuniteService);
  private readonly admin = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);

  readonly query = signal('');
  readonly filter = signal('');
  readonly editing = signal(false);
  readonly editId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly actionError = signal('');
  readonly message = signal('');
  nouvelleCategorie = '';

  // ----- Localité -----
  private readonly api = inject(ApiService);
  readonly formRegion = signal('');
  readonly regionsResource = rxResource({
    stream: () => this.api.get<Option[]>('/api/v1/regions').pipe(catchError(() => of([] as Option[]))),
    defaultValue: [] as Option[],
  });
  readonly communesResource = rxResource({
    params: () => this.formRegion(),
    stream: ({ params }) => (params ? this.api.get<Option[]>(`/api/v1/communes/region/${params}`).pipe(catchError(() => of([] as Option[]))) : of([] as Option[])),
    defaultValue: [] as Option[],
  });

  changerRegion(id: string): void {
    this.formRegion.set(id);
    this.form.regionId = id || null;
    this.form.communeId = '';
  }

  localiteForm(): string {
    const r = this.regionsResource.value().find((x) => x.id === this.formRegion());
    const c = this.communesResource.value().find((x) => x.id === this.form.communeId);
    return c ? `${r?.nom ?? ''} · ${c.nom}` : r ? `Région de ${r.nom}` : 'Tout le Mali';
  }

  // ----- Libellés -----
  private readonly typesLibelles: Record<string, string> = {
    FORMATION_GRATUITE: 'Formation gratuite', BOURSE: 'Bourse', PROGRAMME: 'Programme', APPEL_CANDIDATURE: 'Appel à candidatures',
    CONCOURS: 'Concours', INSERTION: 'Insertion', ACCOMPAGNEMENT: 'Accompagnement', AUTRE: 'Autre',
  };
  libelleType(t: string): string { return this.typesLibelles[t] ?? t; }
  libelleStatut(s: string): string {
    return ({ BROUILLON: 'Brouillon', PUBLIEE: 'Publiée', EXPIREE: 'Expirée', ARCHIVEE: 'Archivée' } as Record<string, string>)[s] ?? s;
  }

  // ----- Candidatures -----
  readonly candidaturesDe = signal<string | null>(null);
  readonly candidaturesResource = rxResource({
    params: () => this.candidaturesDe(),
    stream: ({ params }) => (params ? this.service.candidatures(params).pipe(catchError(() => of([] as Candidature[]))) : of([] as Candidature[])),
    defaultValue: [] as Candidature[],
  });
  readonly titreCandidatures = computed(() => (this.opportunitesResource.value() ?? []).find((o) => o.id === this.candidaturesDe())?.titre ?? '');

  voirCandidatures(id: string): void {
    this.candidaturesDe.set(id);
    setTimeout(() => document.getElementById('titre-candidatures')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }

  statutCandidature(id: string, statut: StatutCandidature): void {
    this.service.changerStatutCandidature(id, statut).subscribe({
      next: () => {
        this.message.set(statut === 'RETENUE' ? 'Candidature retenue : le citoyen est prévenu.' : 'Candidature marquée non retenue.');
        this.candidaturesResource.reload();
      },
      error: (e: { error?: { message?: string } }) => this.actionError.set(e?.error?.message || 'Impossible de modifier la candidature.'),
    });
  }

  readonly statuses: StatutOpportunite[] = ['BROUILLON', 'PUBLIEE', 'EXPIREE', 'ARCHIVEE'];
  readonly types: TypeOpportunite[] = [
    'FORMATION_GRATUITE',
    'BOURSE',
    'PROGRAMME',
    'APPEL_CANDIDATURE',
    'CONCOURS',
    'INSERTION',
    'ACCOMPAGNEMENT',
    'AUTRE',
  ];
  form: OpportuniteRequest = {
    categorieId: '',
    titre: '',
    description: '',
    statut: 'BROUILLON',
    type: 'AUTRE',
    dateExpiration: '',
    regionId: null,
    communeId: '',
  };

  readonly opportunitesResource = rxResource({
    stream: () => this.service.listerPourGestion(),
    defaultValue: [] as OpportuniteDetail[],
  });

  readonly categoriesResource = rxResource({
    stream: () => this.admin.categoriesOpportunites(),
    defaultValue: [] as CategorieOpportunite[],
  });

  readonly categories = computed(() => this.categoriesResource.value() ?? []);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLocaleLowerCase();
    const flt = this.filter();
    const list = this.opportunitesResource.value() ?? [];
    return list.filter(
      (o) =>
        (!flt || o.statut === flt) &&
        (!q ||
          `${o.titre} ${o.description ?? ''} ${o.categorieNom ?? ''}`
            .toLocaleLowerCase()
            .includes(q))
    );
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = (this.opportunitesResource.error() || this.categoriesResource.error()) as
      | Error
      | undefined;
    return err?.message || '';
  }

  count(s: StatutOpportunite): number {
    return (this.opportunitesResource.value() ?? []).filter((o) => o.statut === s).length;
  }

  categoryName(id?: string): string {
    return this.categories().find((c) => c.id === id)?.nom ?? 'Catégorie non renseignée';
  }

  nouveau(): void {
    this.editId.set(null);
    this.form = {
      categorieId: '',
      titre: '',
      description: '',
      statut: 'BROUILLON',
      type: 'AUTRE',
      dateExpiration: '',
      regionId: null,
      communeId: '',
    };
    this.formRegion.set('');
    this.editing.set(true);
    this.actionError.set('');
  }

  editer(o: OpportuniteDetail): void {
    this.editId.set(o.id);
    this.form = {
      categorieId: o.categorieId ?? '',
      titre: o.titre,
      description: o.description ?? '',
      statut: o.statut as StatutOpportunite,
      type: o.type as TypeOpportunite,
      dateExpiration: o.dateExpiration ?? '',
      regionId: o.regionId ?? null,
      communeId: o.communeId ?? '',
    };
    this.formRegion.set(o.regionId ?? '');
    this.editing.set(true);
    this.actionError.set('');
  }

  annuler(): void {
    this.editing.set(false);
    this.editId.set(null);
  }

  enregistrer(): void {
    if (!this.form.categorieId || !this.form.titre.trim() || !this.form.description.trim()) {
      this.actionError.set('La catégorie, le titre et la description sont obligatoires.');
      return;
    }
    if (this.form.dateExpiration && this.form.dateExpiration < new Date().toISOString().slice(0, 10)) {
      this.actionError.set('La date d’expiration ne peut pas être passée.');
      return;
    }
    this.saving.set(true);
    this.actionError.set('');
    const body: OpportuniteRequest = {
      categorieId: this.form.categorieId,
      titre: this.form.titre.trim(),
      description: this.form.description.trim(),
      statut: this.form.statut,
      type: this.form.type,
      ...(this.form.dateExpiration ? { dateExpiration: this.form.dateExpiration } : {}),
      regionId: this.formRegion() || null,
      communeId: this.form.communeId || null,
    };
    const editId = this.editId();
    const req = editId ? this.service.modifier(editId, body) : this.service.creer(body);
    req.subscribe({
      next: () => {
        this.message.set(this.form.statut === 'PUBLIEE' && this.formRegion() ? 'Opportunité enregistrée. Les citoyens de la localité ont été alertés.' : 'Opportunité enregistrée.');
        this.saving.set(false);
        this.editing.set(false);
        this.opportunitesResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible d’enregistrer l’opportunité.');
        this.saving.set(false);
      },
    });
  }

  async changerStatut(o: OpportuniteDetail, s: StatutOpportunite): Promise<void> {
    const ok = await this.confirmation.confirm(`Passer « ${o.titre} » au statut « ${this.libelleStatut(s)} » ?`, { title: 'Modifier le statut', confirmLabel: 'Confirmer', danger: s === 'ARCHIVEE' });
    if (!ok) return;
    this.saving.set(true);
    this.actionError.set('');
    this.service.changerStatut(o, s).subscribe({
      next: () => {
        this.message.set(s === 'PUBLIEE' && o.localite && o.localite !== 'Tout le Mali' ? `Opportunité publiée : les citoyens de ${o.localite} ont été alertés.` : `Statut « ${this.libelleStatut(s)} » enregistré.`);
        this.saving.set(false);
        this.opportunitesResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible de modifier le statut.');
        this.saving.set(false);
      },
    });
  }

  creerCategorie(): void {
    const nom = this.nouvelleCategorie.trim();
    if (!nom) return;
    this.saving.set(true);
    this.admin.creerCategorieOpportunite({ nom }).subscribe({
      next: () => {
        this.nouvelleCategorie = '';
        this.message.set('Catégorie créée.');
        this.saving.set(false);
        this.categoriesResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible de créer la catégorie.');
        this.saving.set(false);
      },
    });
  }

  async supprimerCategorie(c: CategorieOpportunite): Promise<void> {
    const ok = await this.confirmation.confirm(`Supprimer la catégorie « ${c.nom} » ?`, { title: 'Supprimer la catégorie', confirmLabel: 'Supprimer', danger: true });
    if (!ok) return;
    this.admin.supprimerCategorieOpportunite(c.id).subscribe({
      next: () => {
        this.message.set('Catégorie supprimée.');
        this.categoriesResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(
          e.message || 'Suppression refusée. Cette catégorie est peut-être utilisée.'
        );
      },
    });
  }
}
