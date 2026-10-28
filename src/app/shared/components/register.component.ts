import { AuthLayoutComponent } from '../../shared/components/auth-layout.component';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { catchError, concatMap, from, last, map, of, switchMap, toArray } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { VerificationState } from '../../core/auth/verification.state';
import { ToastService } from '../../core/ui/toast.service';
import { ApiService } from '../../core/services/api.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { normalizeMaliPhone } from '../../core/utils/phone';
import { maliPhoneValidator, sameValue } from '../../shared/validators';
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

const pasDansLeFutur = (c: AbstractControl): ValidationErrors | null => {
  const v = String(c.value ?? '');
  return v && v > new Date().toISOString().slice(0, 10) ? { futur: true } : null;
};

const siteWebValide = (c: AbstractControl): ValidationErrors | null => {
  const v = String(c.value ?? '').trim();
  return !v || /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v) ? null : { site: true };
};

/**
 * Inscription d'une organisation en 5 étapes :
 * structure → identité légale → siège et responsable → compte → pièces justificatives.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthLayoutComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly auth = inject(AuthService);
  private readonly verification = inject(VerificationState);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  private readonly organisations = inject(OrganisationService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly types = TYPES_ORGANISATION;
  readonly champs = CHAMPS_LEGAUX;
  readonly documents = DOCUMENTS;
  readonly formats = FORMATS_PIECES;
  readonly aujourdhui = new Date().toISOString().slice(0, 10);

  readonly etapes = ['Structure', 'Identité légale', 'Siège et responsable', 'Compte', 'Pièces'];
  readonly etape = signal(0);

  readonly form = this.fb.group(
    {
      // 1. Structure
      typeOrganisation: ['' as TypeOrganisation | '', Validators.required],
      nomOrganisation: ['', [Validators.required, Validators.maxLength(150)]],
      sigle: ['', [Validators.maxLength(30)]],
      formeJuridique: ['', [Validators.maxLength(80)]],
      secteurActivite: ['', [Validators.maxLength(150)]],
      dateCreation: ['', [pasDansLeFutur]],
      effectif: ['', [Validators.min(0), Validators.max(1000000)]],
      descriptionOrganisation: ['', [Validators.maxLength(500)]],
      // 2. Identité légale
      numeroRccm: ['', [Validators.maxLength(80)]],
      nif: ['', [Validators.maxLength(40)]],
      numeroInps: ['', [Validators.maxLength(40)]],
      numeroRecepisse: ['', [Validators.maxLength(80)]],
      numeroAccordCadre: ['', [Validators.maxLength(80)]],
      referenceActe: ['', [Validators.maxLength(150)]],
      // 3. Siège et responsable
      regionId: ['', Validators.required],
      communeId: ['', Validators.required],
      adresse: ['', [Validators.maxLength(255)]],
      siteWeb: ['', [Validators.maxLength(255), siteWebValide]],
      responsableNom: ['', [Validators.required, Validators.maxLength(150)]],
      responsableFonction: ['', [Validators.maxLength(100)]],
      responsableTelephone: ['', [maliPhoneValidator]],
      // 4. Compte
      telephone: ['', [Validators.required, maliPhoneValidator]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmation: ['', [Validators.required]],
      attestation: [false, Validators.requiredTrue],
    },
    { validators: sameValue('password', 'confirmation') },
  );

  private readonly controlesParEtape: string[][] = [
    ['typeOrganisation', 'nomOrganisation', 'sigle', 'formeJuridique', 'secteurActivite', 'dateCreation', 'effectif', 'descriptionOrganisation'],
    ['numeroRccm', 'nif', 'numeroInps', 'numeroRecepisse', 'numeroAccordCadre', 'referenceActe'],
    ['regionId', 'communeId', 'adresse', 'siteWeb', 'responsableNom', 'responsableFonction', 'responsableTelephone'],
    ['telephone', 'email', 'password', 'confirmation', 'attestation'],
    [],
  ];

  readonly typeChoisi = toSignal(this.form.controls.typeOrganisation.valueChanges, { initialValue: '' as TypeOrganisation | '' });
  readonly definition = computed(() => definitionType(this.typeChoisi()));
  readonly champsAffiches = computed<ChampLegal[]>(() => {
    const d = this.definition();
    return d ? [...d.champsObligatoires, ...d.champsUtiles] : [];
  });

  private readonly regionChoisie = toSignal(this.form.controls.regionId.valueChanges, { initialValue: '' });
  readonly regionsResource = rxResource({
    stream: () => this.api.get<Option[]>('/api/v1/regions').pipe(catchError(() => of([] as Option[]))),
    defaultValue: [] as Option[],
  });
  readonly communesResource = rxResource({
    params: () => this.regionChoisie(),
    stream: ({ params }) => (params ? this.api.get<Option[]>(`/api/v1/communes/region/${params}`).pipe(catchError(() => of([] as Option[]))) : of([] as Option[])),
    defaultValue: [] as Option[],
  });

  /** Pièces sélectionnées, envoyées juste après la création du compte. */
  readonly pieces = signal<Partial<Record<TypeDocument, File>>>({});
  readonly erreursPieces = signal<Partial<Record<TypeDocument, string>>>({});
  readonly piecesListe = computed<{ type: TypeDocument; obligatoire: boolean }[]>(() => {
    const d = this.definition();
    if (!d) return [];
    return [
      ...d.documentsObligatoires.map((type) => ({ type, obligatoire: true })),
      ...d.documentsConseilles.map((type) => ({ type, obligatoire: false })),
    ];
  });
  readonly piecesManquantes = computed(() =>
    this.piecesListe().filter((p) => p.obligatoire && !this.pieces()[p.type]).length,
  );

  readonly loading = signal(false);
  readonly progression = signal('');
  readonly error = signal('');

  constructor() {
    // Les numéros exigés suivent la nature juridique choisie.
    this.form.controls.typeOrganisation.valueChanges.subscribe((code) => {
      const d = definitionType(code);
      for (const champ of Object.keys(CHAMPS_LEGAUX) as ChampLegal[]) {
        const c = this.form.controls[champ];
        const max = champ === 'referenceActe' ? 150 : champ === 'nif' || champ === 'numeroInps' ? 40 : 80;
        c.setValidators(d?.champsObligatoires.includes(champ) ? [Validators.required, Validators.maxLength(max)] : [Validators.maxLength(max)]);
        c.updateValueAndValidity({ emitEvent: false });
      }
      this.pieces.set({});
      this.erreursPieces.set({});
    });
    this.form.controls.regionId.valueChanges.subscribe(() => this.form.controls.communeId.setValue(''));
  }

  invalid(name: string, error?: string): boolean {
    const control = this.form.get(name);
    if (!control || !control.touched) return false;
    return error ? control.hasError(error) : control.invalid;
  }

  get passwordsDiffer(): boolean {
    return this.form.hasError('mismatch') && !!this.form.get('confirmation')?.touched;
  }

  obligatoire(champ: ChampLegal): boolean {
    return !!this.definition()?.champsObligatoires.includes(champ);
  }

  libelleChamp(champ: ChampLegal): string {
    const d = this.definition();
    return champ === 'numeroRccm' && d?.libelleImmatriculation ? d.libelleImmatriculation : CHAMPS_LEGAUX[champ].libelle;
  }

  /** Revient au choix de la nature juridique : les autres types réapparaissent. */
  changerType(): void {
    this.form.controls.typeOrganisation.setValue('');
    this.form.controls.typeOrganisation.markAsUntouched();
  }

  choisirType(code: TypeOrganisation): void {
    this.form.controls.typeOrganisation.setValue(code);
    this.form.controls.typeOrganisation.markAsTouched();
    if (!this.definition()?.formes.includes(this.form.controls.formeJuridique.value)) {
      this.form.controls.formeJuridique.setValue('');
    }
  }

  private etapeValide(i: number): boolean {
    const noms = this.controlesParEtape[i];
    noms.forEach((n) => this.form.get(n)?.markAsTouched());
    const ok = noms.every((n) => this.form.get(n)?.valid);
    return i === 3 ? ok && !this.form.hasError('mismatch') : ok;
  }

  suivant(): void {
    this.error.set('');
    if (!this.etapeValide(this.etape())) {
      this.error.set('Certaines informations sont manquantes ou invalides : corrigez les champs signalés en rouge.');
      return;
    }
    this.etape.update((e) => Math.min(e + 1, this.etapes.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  precedent(): void {
    this.error.set('');
    this.etape.update((e) => Math.max(e - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  allerA(i: number): void {
    if (i >= this.etape()) return;
    this.error.set('');
    this.etape.set(i);
  }

  choisirPiece(type: TypeDocument, input: HTMLInputElement): void {
    const f = input.files?.[0];
    if (!f) return;
    const err = verifierFichierPiece(f);
    this.erreursPieces.update((e) => ({ ...e, [type]: err ?? undefined }));
    if (!err) this.pieces.update((p) => ({ ...p, [type]: f }));
    input.value = '';
  }

  retirerPiece(type: TypeDocument): void {
    this.pieces.update((p) => {
      const copie = { ...p };
      delete copie[type];
      return copie;
    });
  }

  taille(f: File): string {
    return f.size > 1024 * 1024 ? `${(f.size / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(f.size / 1024))} Ko`;
  }

  submit(): void {
    this.error.set('');
    for (let i = 0; i < 4; i++) {
      if (!this.etapeValide(i)) {
        this.etape.set(i);
        this.error.set('Certaines informations sont manquantes ou invalides : corrigez les champs signalés en rouge.');
        return;
      }
    }
    const v = this.form.getRawValue();
    const texte = (s: string) => s.trim() || null;
    this.loading.set(true);
    this.progression.set('Création du compte…');
    const email = v.email.trim().toLowerCase();
    this.auth
      .register({
        role: 'ORGANISATION',
        nomOrganisation: v.nomOrganisation.trim(),
        descriptionOrganisation: v.descriptionOrganisation.trim() || undefined,
        telephone: normalizeMaliPhone(v.telephone) ?? v.telephone.trim(),
        email,
        password: v.password,
        conditionsAcceptees: v.attestation === true,
        organisation: {
          typeOrganisation: (v.typeOrganisation || null) as TypeOrganisation | null,
          sigle: texte(v.sigle),
          formeJuridique: texte(v.formeJuridique),
          secteurActivite: texte(v.secteurActivite),
          dateCreation: v.dateCreation || null,
          effectif: v.effectif === '' ? null : Number(v.effectif),
          numeroRccm: texte(v.numeroRccm),
          nif: texte(v.nif),
          numeroInps: texte(v.numeroInps),
          numeroRecepisse: texte(v.numeroRecepisse),
          numeroAccordCadre: texte(v.numeroAccordCadre),
          referenceActe: texte(v.referenceActe),
          adresse: texte(v.adresse),
          communeId: v.communeId || null,
          siteWeb: texte(v.siteWeb),
          responsableNom: texte(v.responsableNom),
          responsableFonction: texte(v.responsableFonction),
          responsableTelephone: v.responsableTelephone.trim() ? normalizeMaliPhone(v.responsableTelephone) ?? v.responsableTelephone.trim() : null,
        },
      })
      .subscribe({
        next: (reponse) => {
          this.loading.set(false);
          this.progression.set('');
          // Le compte est créé mais bloqué : la session s'ouvre à la saisie du code reçu.
          // Les pièces restent en mémoire et partent une fois la session ouverte.
          this.verification.courante.set({
            identifiant: email || (normalizeMaliPhone(v.telephone) ?? v.telephone.trim()),
            canaux: reponse.canaux?.length ? reponse.canaux : ['TELEPHONE'],
            codeDejaEnvoye: true,
            pieces: Object.entries(this.pieces()) as [TypeDocument, File][],
          });
          void this.router.navigate(['/auth/verification']);
        },
        error: (e: HttpErrorResponse) => {
          this.loading.set(false);
          this.progression.set('');
          this.error.set(e.status === 0 ? 'Connexion impossible. Vérifiez votre réseau.' : (e.error?.message ?? 'Création du compte impossible.'));
          if (e.status === 409 || /téléphone|email/i.test(e.error?.message ?? '')) this.etape.set(3);
        },
      });
  }
}
