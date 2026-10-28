import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { OrganisationService, OrganisationDocument } from '../../core/services/organisation.service';
import { Organisation } from '../../shared/models';
import { DOCUMENTS, TypeDocument } from '../../core/organisation/organisation-legal';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, OrganisationAdmin } from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';

@Component({
  selector: 'app-organisations-admin',
  standalone: true,
  imports: [DatePipe, FormsModule, PageHeaderComponent],
  template: `
    <mc-page-header title="Organisations" description="Examinez les dossiers et enregistrez votre décision." />
    <section class="mc-card p-5 sm:p-6">
      @if (message()) { <p class="mb-4 text-sm text-emerald-800" role="status">{{ message() }}</p> }
      @if (organisationsResource.error() || actionError()) { <p class="mb-4 text-sm text-red-700" role="alert">{{ errorMessage() }}</p> }
      <div class="mb-4 flex flex-col gap-3 md:flex-row"><input class="mc-input md:max-w-sm" type="search" [ngModel]="recherche()" (ngModelChange)="recherche.set($event); page.set(1)" placeholder="Rechercher une organisation" aria-label="Rechercher une organisation" /><select class="mc-input md:max-w-xs" [ngModel]="filtre()" (ngModelChange)="filtre.set($event); page.set(1)" aria-label="Filtrer par statut"><option value="">Tous les statuts</option><option value="EN_ATTENTE">En attente</option><option value="APPROUVEE">Approuvée</option><option value="REJETEE">Rejetée</option><option value="SUSPENDUE">Suspendue</option></select></div>
      @if (organisationsResource.isLoading()) { <p class="py-8 text-sm text-slate-500" role="status">Chargement des organisations…</p> }
      @else if (items().length === 0) { <p class="py-8 text-sm text-slate-500">Aucune organisation ne correspond aux filtres.</p> }
      @else { <div class="overflow-x-auto"><table class="table w-full"><thead><tr><th>Organisation</th><th>Nature et numéros</th><th>Siège</th><th>Dossier</th><th>Statut</th><th>Décisions</th></tr></thead><tbody>
        @for (item of pageItems(); track item.id) { <tr [class.bg-base-200]="selection() === item.id"><td><div class="font-semibold">{{ item.nom }}</div><p class="max-w-xs text-xs text-slate-500">{{ item.email || 'E-mail non communiqué' }}</p></td><td><div class="text-sm">{{ item.typeOrganisationLibelle || 'Non précisée' }}</div><div class="font-mono text-xs text-slate-500">@if (item.numeroRccm) { RCCM {{ item.numeroRccm }} } @if (item.nif) { · NIF {{ item.nif }} }</div></td><td class="text-sm">{{ item.communeNom ? item.communeNom + (item.regionNom ? ' (' + item.regionNom + ')' : '') : '—' }}</td><td class="min-w-36">@if (item.dossierComplet) { <span class="badge mc-badge-lisible badge-success badge-sm">Complet</span> } @else { <span class="badge mc-badge-lisible badge-warning badge-sm">Incomplet</span> }<div class="mt-1 text-xs text-slate-500">{{ item.nombreDocuments ?? 0 }} document(s)@if (!item.dossierComplet && item.typeOrganisation && item.nombreDocumentsManquants) { · {{ item.nombreDocumentsManquants }} manquant(s) }</div></td><td><span class="badge mc-badge-lisible" [class.badge-warning]="item.statut === 'EN_ATTENTE'">{{ labelStatut(item.statut) }}</span></td><td><div class="flex flex-wrap gap-2"><button class="btn btn-sm btn-primary" type="button" (click)="ouvrirDossier(item.id)">Examiner le dossier</button><button class="btn btn-sm btn-secondary" [disabled]="pending.has(item.id) || item.statut === 'APPROUVEE'" (click)="decider(item, 'APPROUVEE')">Approuver</button><button class="btn btn-sm btn-secondary" [disabled]="pending.has(item.id) || item.statut === 'SUSPENDUE'" (click)="decider(item, 'SUSPENDUE')">Suspendre</button><button class="btn btn-sm btn-secondary" [disabled]="pending.has(item.id) || item.statut === 'REJETEE'" (click)="decider(item, 'REJETEE')">Rejeter</button></div></td></tr> }
      </tbody></table></div><div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><span>{{ items().length }} résultat(s) · Page {{ page() }} / {{ totalPages() }}</span><div class="flex gap-2"><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Précédent</button><button class="btn btn-sm btn-secondary" type="button" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">Suivant</button></div></div> }
    </section>

    @if (selection()) {
      <section #dossier class="mc-card mt-6 p-5 sm:p-6" aria-labelledby="titre-dossier">
        @if (detailResource.isLoading()) { <p class="text-sm" role="status">Chargement du dossier…</p> }
        @else if (detailResource.value(); as o) {
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="titre-dossier" class="text-lg font-semibold">{{ o.nom }} @if (o.sigle) { ({{ o.sigle }}) }</h2>
              <p class="text-sm text-slate-500">{{ o.typeOrganisationLibelle || 'Nature juridique non précisée' }} @if (o.formeJuridique) { · {{ o.formeJuridique }} }</p>
            </div>
            <button class="btn btn-sm btn-ghost" type="button" (click)="selection.set(null)">Fermer</button>
          </div>
          <dl class="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            @for (l of lignes(o); track l[0]) {
              <div><dt class="text-xs text-slate-500">{{ l[0] }}</dt><dd class="font-medium" [class.font-mono]="l[2]">{{ l[1] || '—' }}</dd></div>
            }
          </dl>
          @if (o.description) { <p class="mt-4 text-sm"><span class="text-xs text-slate-500">Présentation :</span> {{ o.description }}</p> }

          <h3 class="mt-6 font-semibold">Pièces justificatives</h3>
          @if ((o.documentsManquants ?? []).length) {
            <p class="mt-1 text-sm text-warning-content">Manquantes : {{ libellesDocs(o.documentsManquants) }}</p>
          }
          @if (docsResource.isLoading()) { <p class="mt-2 text-sm" role="status">Chargement des pièces…</p> }
          @else if (!docsResource.value().length) { <p class="mt-2 text-sm text-slate-500">Aucune pièce déposée.</p> }
          @else {
            <ul class="mt-3 space-y-2">
              @for (d of docsResource.value(); track d.id) {
                <li class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-base-200 px-3 py-2 text-sm">
                  <span class="min-w-0"><span class="font-medium">{{ d.typeDocumentLibelle }}</span><span class="block truncate text-xs text-slate-500">{{ d.nomFichier }} · {{ d.dateDepot | date:'dd/MM/yyyy' }}</span>
                    @if (d.statut === 'REJETE' && d.commentaire) { <span class="block text-xs text-error">Motif : {{ d.commentaire }}</span> }</span>
                  <span class="flex flex-wrap items-center gap-2">
                    <span class="badge mc-badge-lisible badge-sm" [class.badge-success]="d.statut === 'VALIDE'" [class.badge-error]="d.statut === 'REJETE'" [class.badge-warning]="d.statut === 'EN_ATTENTE'">{{ d.statut === 'VALIDE' ? 'Validé' : d.statut === 'REJETE' ? 'Refusé' : 'À vérifier' }}</span>
                    <button class="btn btn-xs btn-ghost" type="button" (click)="ouvrirDocument(d.id)">Voir</button>
                    <button class="btn btn-xs btn-secondary" type="button" [disabled]="d.statut === 'VALIDE'" (click)="verifierDocument(d.id, 'VALIDE')">Valider</button>
                    <button class="btn btn-xs btn-secondary" type="button" [disabled]="d.statut === 'REJETE'" (click)="verifierDocument(d.id, 'REJETE')">Refuser</button>
                  </span>
                </li>
              }
            </ul>
          }
        } @else { <p class="text-sm text-red-700" role="alert">Impossible de charger ce dossier.</p> }
      </section>
    }
  `,
})
export class OrganisationsAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);

  readonly recherche = signal('');
  readonly filtre = signal('');
  readonly page = signal(1);
  readonly pageSize = 10;
  readonly message = signal('');
  readonly actionError = signal('');
  readonly pending = new Set<string>();

  // ----- Dossier détaillé -----
  private readonly orgs = inject(OrganisationService);
  readonly selection = signal<string | null>(null);
  readonly detailResource = rxResource({
    params: () => this.selection(),
    stream: ({ params }) => (params ? this.orgs.obtenir(params) : of(undefined as unknown as Organisation)),
  });
  readonly docsResource = rxResource({
    params: () => this.selection(),
    stream: ({ params }) => (params ? this.orgs.documentsOrganisation(params) : of([] as OrganisationDocument[])),
    defaultValue: [] as OrganisationDocument[],
  });

  ouvrirDossier(id: string): void {
    this.selection.set(id);
    setTimeout(() => document.getElementById('titre-dossier')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  }

  lignes(o: Organisation): [string, string | null | undefined, boolean][] {
    return [
      ['N° RCCM / immatriculation', o.numeroRccm, true],
      ['NIF', o.nif, true],
      ['N° employeur INPS', o.numeroInps, true],
      ['Récépissé de déclaration', o.numeroRecepisse, true],
      ['Accord-cadre ONG', o.numeroAccordCadre, true],
      ["Acte de création / agrément", o.referenceActe, false],
      ["Secteur d'activité", o.secteurActivite, false],
      ['Date de création', o.dateCreation, false],
      ['Effectif', o.effectif == null ? null : String(o.effectif), false],
      ['Siège', [o.adresse, o.communeNom, o.regionNom].filter(Boolean).join(', '), false],
      ['Responsable légal', [o.responsableNom, o.responsableFonction].filter(Boolean).join(' — '), false],
      ['Téléphone du responsable', o.responsableTelephone, false],
      ['Téléphone du compte', o.telephone, false],
      ['E-mail', o.utilisateurEmail, false],
      ['Site web', o.siteWeb, false],
    ];
  }

  libellesDocs(codes: string[] | undefined): string {
    return (codes ?? []).map((c) => DOCUMENTS[c as TypeDocument]?.libelle ?? c).join(', ');
  }

  ouvrirDocument(id: string): void {
    this.orgs.fichierDocument(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => this.actionError.set('Impossible d’ouvrir ce document.'),
    });
  }

  async verifierDocument(id: string, statut: 'VALIDE' | 'REJETE'): Promise<void> {
    let commentaire: string | undefined;
    if (statut === 'REJETE') {
      const saisi = await this.confirmation.askText('Indiquez pourquoi ce document est refusé : l’organisation verra ce motif.', {
        title: 'Refuser le document', inputLabel: 'Motif', inputPlaceholder: 'Ex. : document illisible, expiré…', inputRequired: true, inputMaxLength: 1000, confirmLabel: 'Refuser', danger: true,
      });
      commentaire = saisi?.trim();
      if (!commentaire) return;
    }
    this.actionError.set('');
    this.orgs.verifierDocument(id, statut, commentaire).subscribe({
      next: () => {
        this.message.set(statut === 'VALIDE' ? 'Document validé.' : 'Document refusé.');
        this.docsResource.reload();
        this.detailResource.reload();
        this.organisationsResource.reload();
      },
      error: (e: { error?: { message?: string } }) => this.actionError.set(e?.error?.message || 'La vérification n’a pas été enregistrée.'),
    });
  }

  readonly organisationsResource = rxResource({
    stream: () => this.service.organisations(),
    defaultValue: [] as OrganisationAdmin[],
  });

  readonly items = computed(() => {
    const q = this.recherche().trim().toLocaleLowerCase();
    const flt = this.filtre();
    const list = this.organisationsResource.value() ?? [];
    return list
      .filter(
        (o) =>
          (!flt || o.statut === flt) &&
          (!q || `${o.nom} ${o.email ?? ''} ${o.numeroRccm ?? ''} ${o.nif ?? ''} ${o.communeNom ?? ''}`.toLocaleLowerCase().includes(q))
      )
      .sort(
        (a, b) =>
          Number(b.statut === 'EN_ATTENTE') - Number(a.statut === 'EN_ATTENTE') ||
          a.nom.localeCompare(b.nom)
      );
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.items().length / this.pageSize)));

  readonly pageItems = computed(() => {
    const p = Math.min(this.page(), this.totalPages());
    return this.items().slice((p - 1) * this.pageSize, p * this.pageSize);
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = this.organisationsResource.error() as Error | undefined;
    return err?.message || 'Impossible de charger les organisations.';
  }

  labelStatut(s: string): string {
    return (
      ({
        EN_ATTENTE: 'En attente',
        APPROUVEE: 'Approuvée',
        REJETEE: 'Rejetée',
        SUSPENDUE: 'Suspendue',
      } as Record<string, string>)[s] ?? s
    );
  }

  async decider(item: OrganisationAdmin, statut: 'APPROUVEE' | 'REJETEE' | 'SUSPENDUE'): Promise<void> {
    let motif: string | undefined;
    if (statut === 'REJETEE' || statut === 'SUSPENDUE') {
      const saisi = await this.confirmation.askText(
        `Un motif est nécessaire pour ${statut === 'REJETEE' ? 'rejeter' : 'suspendre'} « ${item.nom} ».`,
        { title: statut === 'REJETEE' ? 'Motif du rejet' : 'Motif de suspension', inputLabel: 'Motif', inputPlaceholder: 'Expliquez brièvement la décision', inputRequired: true, inputMaxLength: 2000, confirmLabel: 'Continuer', danger: true },
      );
      motif = saisi?.trim();
      if (!motif) return;
    }
    if (this.pending.has(item.id)) return;
    const ok = await this.confirmation.confirm(
      `${statut === 'APPROUVEE' ? 'Approuver' : statut === 'REJETEE' ? 'Rejeter' : 'Suspendre'} l’organisation « ${item.nom} » ?${motif ? ` Motif : ${motif}` : ''}`,
      { title: 'Décision sur une organisation', confirmLabel: statut === 'APPROUVEE' ? 'Approuver' : statut === 'REJETEE' ? 'Rejeter' : 'Suspendre', danger: statut !== 'APPROUVEE' },
    );
    if (!ok) return;
    const old = item.statut;
    this.pending.add(item.id);
    this.actionError.set('');
    this.message.set('');
    this.service.modifierStatutOrganisation(item.id, statut, motif).subscribe({
      next: (updated) => {
        item.statut = updated.statut ?? statut;
        this.pending.delete(item.id);
        this.message.set(
          `Le statut est maintenant « ${this.labelStatut(item.statut)} » pour ${item.nom}.`
        );
        this.organisationsResource.reload();
      },
      error: (e: Error) => {
        item.statut = old;
        this.pending.delete(item.id);
        this.actionError.set(e.message || 'La décision n’a pas été enregistrée.');
      },
    });
  }
}
