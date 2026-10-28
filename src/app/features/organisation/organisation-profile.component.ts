import { LibellePipe } from '../../shared/libelle.pipe';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';
import { OrganisationDocument } from '../../core/services/organisation.service';
import {
  CHAMPS_LEGAUX,
  ChampLegal,
  DOCUMENTS,
  FORMATS_PIECES,
  TYPES_ORGANISATION,
  TypeDocument,
  TypeOrganisation,
  definitionType,
  verifierFichierPiece,
} from '../../core/organisation/organisation-legal';

interface Option { id: string; nom: string; }
import { PageHeaderComponent, PositionPickerComponent } from '../../shared/components';
import { GeolocalisationService } from '../../core/services/geolocalisation.service';
import { OrganisationService } from '../../core/services/organisation.service';

@Component({
  selector: 'app-organisation-profile',
  standalone: true,
  imports: [LibellePipe, DatePipe, FormsModule, PageHeaderComponent, PositionPickerComponent],
  templateUrl: './organisation-profile.component.html',
})
export class OrganisationProfileComponent {
  private readonly service = inject(OrganisationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly organisationResource = rxResource({
    stream: () => this.service.obtenirPourUtilisateur(),
  });

  // ----- Géolocalisation de l'organisation -----
  private readonly geo = inject(GeolocalisationService);
  readonly positionResource = rxResource({ stream: () => this.geo.maPositionOrganisation() });
  readonly positionSaving = signal(false);
  readonly positionMessage = signal('');
  readonly positionError = signal('');

  enregistrerPosition(p: { latitude: number; longitude: number }): void {
    this.positionSaving.set(true);
    this.positionMessage.set('');
    this.positionError.set('');
    this.geo.definirPositionOrganisation(p.latitude, p.longitude).subscribe({
      next: (pos) => {
        this.positionResource.set(pos);
        this.positionSaving.set(false);
        this.positionMessage.set('Position de l’organisation enregistrée.');
      },
      error: (e) => {
        this.positionSaving.set(false);
        this.positionError.set(e?.error?.message || 'Impossible d’enregistrer la position.');
      },
    });
  }

  effacerPosition(): void {
    this.positionSaving.set(true);
    this.positionMessage.set('');
    this.positionError.set('');
    this.geo.effacerPositionOrganisation().subscribe({
      next: () => {
        this.positionResource.set({ latitude: null, longitude: null, definie: false });
        this.positionSaving.set(false);
        this.positionMessage.set('Position retirée.');
      },
      error: (e) => {
        this.positionSaving.set(false);
        this.positionError.set(e?.error?.message || 'Impossible de retirer la position.');
      },
    });
  }

  readonly editNom = signal('');
  readonly editDescription = signal('');

  // ----- Identité juridique (modèle du formulaire) -----
  readonly types = TYPES_ORGANISATION;
  readonly champs = CHAMPS_LEGAUX;
  readonly documents = DOCUMENTS;
  readonly formats = FORMATS_PIECES;
  readonly champsLegaux = Object.keys(CHAMPS_LEGAUX) as ChampLegal[];
  edit: Record<string, string> = {};
  readonly typeEdite = signal<string>('');
  readonly regionEditee = signal<string>('');
  readonly definition = computed(() => definitionType(this.typeEdite()));

  private readonly api = inject(ApiService);
  readonly regionsResource = rxResource({
    stream: () => this.api.get<Option[]>('/api/v1/regions').pipe(catchError(() => of([] as Option[]))),
    defaultValue: [] as Option[],
  });
  readonly communesResource = rxResource({
    params: () => this.regionEditee(),
    stream: ({ params }) => (params ? this.api.get<Option[]>(`/api/v1/communes/region/${params}`).pipe(catchError(() => of([] as Option[]))) : of([] as Option[])),
    defaultValue: [] as Option[],
  });

  constructor() {
    effect(() => {
      const org = this.organisationResource.value();
      if (org) {
        this.editNom.set(org.nom ?? '');
        this.editDescription.set(org.description ?? '');
        this.edit = {
          typeOrganisation: org.typeOrganisation ?? '',
          sigle: org.sigle ?? '',
          formeJuridique: org.formeJuridique ?? '',
          secteurActivite: org.secteurActivite ?? '',
          dateCreation: org.dateCreation ?? '',
          effectif: org.effectif == null ? '' : String(org.effectif),
          numeroRccm: org.numeroRccm ?? '',
          nif: org.nif ?? '',
          numeroInps: org.numeroInps ?? '',
          numeroRecepisse: org.numeroRecepisse ?? '',
          numeroAccordCadre: org.numeroAccordCadre ?? '',
          referenceActe: org.referenceActe ?? '',
          adresse: org.adresse ?? '',
          communeId: org.communeId ?? '',
          siteWeb: org.siteWeb ?? '',
          responsableNom: org.responsableNom ?? '',
          responsableFonction: org.responsableFonction ?? '',
          responsableTelephone: org.responsableTelephone ?? '',
        };
        this.typeEdite.set(this.edit['typeOrganisation']);
        this.regionEditee.set(org.regionId ?? '');
      }
    });
  }

  changerType(code: string): void {
    this.edit['typeOrganisation'] = code;
    this.typeEdite.set(code);
  }

  changerRegion(id: string): void {
    this.regionEditee.set(id);
    this.edit['communeId'] = '';
  }

  champsAffiches(): ChampLegal[] {
    const d = this.definition();
    return d ? [...d.champsObligatoires, ...d.champsUtiles] : [];
  }

  obligatoire(champ: ChampLegal): boolean {
    return !!this.definition()?.champsObligatoires.includes(champ);
  }

  libelleChamp(champ: ChampLegal): string {
    const d = this.definition();
    return champ === 'numeroRccm' && d?.libelleImmatriculation ? d.libelleImmatriculation : CHAMPS_LEGAUX[champ].libelle;
  }

  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly success = signal('');

  readonly champsManquants = computed(() => {
    const org = this.organisationResource.value();
    if (!org) return [] as string[];
    const missing: string[] = [];
    if (!org.nom?.trim()) missing.push('Nom de l’organisation');
    if (!org.description?.trim()) missing.push('Présentation');
    if (!org.typeOrganisation) missing.push('Nature juridique');
    const d = definitionType(org.typeOrganisation);
    for (const champ of d?.champsObligatoires ?? []) {
      if (!String((org as unknown as Record<string, unknown>)[champ] ?? '').trim()) missing.push(CHAMPS_LEGAUX[champ].libelle);
    }
    if (!org.communeId) missing.push('Commune du siège');
    if (!org.responsableNom) missing.push('Responsable légal');
    for (const doc of org.documentsManquants ?? []) missing.push(DOCUMENTS[doc as TypeDocument]?.libelle ?? doc);
    return missing;
  });

  readonly completion = computed(() => {
    const org = this.organisationResource.value();
    if (!org) return 0;
    const d = definitionType(org.typeOrganisation);
    const total = 6 + (d?.champsObligatoires.length ?? 0) + (org.documentsObligatoires?.length ?? 0);
    return Math.max(0, Math.round(((total - this.champsManquants().length) / total) * 100));
  });

  readonly statutLabel = computed(() => {
    switch (this.organisationResource.value()?.statut) {
      case 'APPROUVEE': return 'Validée';
      case 'EN_ATTENTE': return 'En attente de validation';
      case 'REJETEE': return 'Refusée';
      case 'SUSPENDUE': return 'Suspendue';
      default: return 'Non renseigné';
    }
  });

  // ----- Pièces justificatives -----
  readonly documentsResource = rxResource({
    stream: () => this.service.mesDocuments().pipe(catchError(() => of([] as OrganisationDocument[]))),
    defaultValue: [] as OrganisationDocument[],
  });
  readonly docBusy = signal<string | null>(null);
  readonly docMessage = signal('');
  readonly docErreur = signal('');

  /** Pièces attendues (obligatoires puis conseillées), et les autres pièces déjà déposées. */
  readonly piecesAttendues = computed(() => {
    const org = this.organisationResource.value();
    const obligatoires = (org?.documentsObligatoires ?? []) as TypeDocument[];
    const conseillees = (org?.documentsConseilles ?? []) as TypeDocument[];
    const deposes = this.documentsResource.value().map((d) => d.typeDocument);
    const autres = [...new Set(deposes)].filter((t) => !obligatoires.includes(t) && !conseillees.includes(t));
    return [
      ...obligatoires.map((type) => ({ type, niveau: 'Obligatoire' })),
      ...conseillees.map((type) => ({ type, niveau: 'Conseillé' })),
      ...autres.map((type) => ({ type, niveau: 'Déposé' })),
    ];
  });

  documentsDe(type: TypeDocument): OrganisationDocument[] {
    return this.documentsResource.value().filter((d) => d.typeDocument === type);
  }

  libelleStatutDoc(s: string): string {
    return s === 'VALIDE' ? 'Validé' : s === 'REJETE' ? 'Refusé' : 'En vérification';
  }

  deposer(type: TypeDocument, input: HTMLInputElement): void {
    const f = input.files?.[0];
    input.value = '';
    if (!f) return;
    const err = verifierFichierPiece(f);
    this.docMessage.set('');
    this.docErreur.set(err ?? '');
    if (err) return;
    this.docBusy.set(type);
    this.service.deposerDocument(type, f).subscribe({
      next: () => {
        this.docBusy.set(null);
        this.docMessage.set(`${DOCUMENTS[type].libelle} : document envoyé pour vérification.`);
        this.documentsResource.reload();
        this.organisationResource.reload();
      },
      error: (e) => {
        this.docBusy.set(null);
        this.docErreur.set(e?.error?.message || 'Envoi du document impossible.');
      },
    });
  }

  ouvrir(doc: OrganisationDocument): void {
    this.service.fichierDocument(doc.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => this.docErreur.set('Impossible d’ouvrir ce document.'),
    });
  }

  async supprimer(doc: OrganisationDocument): Promise<void> {
    const ok = await this.confirmation.confirm(`Supprimer « ${doc.nomFichier} » ?`, { title: 'Supprimer un document', confirmLabel: 'Supprimer', danger: true });
    if (!ok) return;
    this.docBusy.set(doc.typeDocument);
    this.service.supprimerDocument(doc.id).subscribe({
      next: () => {
        this.docBusy.set(null);
        this.docMessage.set('Document supprimé.');
        this.documentsResource.reload();
        this.organisationResource.reload();
      },
      error: (e) => {
        this.docBusy.set(null);
        this.docErreur.set(e?.error?.message || 'Suppression impossible.');
      },
    });
  }

  errorMessage(): string {
    const err = this.organisationResource.error() as { message?: string } | undefined;
    return this.saveError() || err?.message || 'Impossible de charger le profil organisation.';
  }

  save(): void {
    const org = this.organisationResource.value();
    if (!org || this.saving() || !this.editNom().trim()) return;
    const e = this.edit;
    const d = definitionType(e['typeOrganisation']);
    const manquant = !e['typeOrganisation'] ? 'la nature juridique'
      : (d?.champsObligatoires.find((c) => !e[c]?.trim()) ? CHAMPS_LEGAUX[d!.champsObligatoires.find((c) => !e[c]?.trim())!].libelle
      : !e['communeId'] ? 'la commune du siège'
      : !e['responsableNom']?.trim() ? 'le responsable légal' : '');
    if (manquant) {
      this.saveError.set(`Complétez ${manquant} avant d’enregistrer.`);
      return;
    }
    this.saving.set(true);
    this.saveError.set('');
    this.success.set('');
    const texte = (k: string) => e[k]?.trim() || null;
    this.service
      .modifierMonProfil({
        nom: this.editNom().trim(),
        description: this.editDescription().trim(),
        identite: {
          typeOrganisation: e['typeOrganisation'] as TypeOrganisation,
          sigle: texte('sigle'),
          formeJuridique: texte('formeJuridique'),
          secteurActivite: texte('secteurActivite'),
          dateCreation: e['dateCreation'] || null,
          effectif: e['effectif'] === '' || e['effectif'] == null ? null : Number(e['effectif']),
          numeroRccm: texte('numeroRccm'),
          nif: texte('nif'),
          numeroInps: texte('numeroInps'),
          numeroRecepisse: texte('numeroRecepisse'),
          numeroAccordCadre: texte('numeroAccordCadre'),
          referenceActe: texte('referenceActe'),
          adresse: texte('adresse'),
          communeId: e['communeId'] || null,
          siteWeb: texte('siteWeb'),
          responsableNom: texte('responsableNom'),
          responsableFonction: texte('responsableFonction'),
          responsableTelephone: texte('responsableTelephone'),
        },
      })
      .subscribe({
        next: () => {
          this.success.set('Le profil a été enregistré.');
          this.saving.set(false);
          this.organisationResource.reload();
        },
        error: (error: { error?: { message?: string }; message?: string }) => {
          this.saveError.set(error.error?.message || error.message || 'Impossible d’enregistrer le profil.');
          this.saving.set(false);
        },
      });
  }
}
