import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, CommuneAdmin, RegionAdmin } from '../../core/services/admin.service';
import { ConfirmationService } from '../../core/ui/confirmation.service';

type TypeFormulaire = 'region' | 'commune';

@Component({
  selector: 'app-territoires-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent],
  templateUrl: './territoires-admin.component.html',
})
export class TerritoiresAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);

  readonly rechercheRegion = signal('');
  readonly rechercheCommune = signal('');
  readonly regionSelectionnee = signal<RegionAdmin | null>(null);
  readonly modalOuvert = signal(false);
  readonly typeFormulaire = signal<TypeFormulaire>('region');
  readonly saving = signal(false);
  readonly actionError = signal('');
  readonly message = signal('');
  readonly regionEditId = signal<string | null>(null);
  readonly communeEditId = signal<string | null>(null);

  regionForm: {
    nom: string;
    description?: string;
    codeStable?: string;
    niveau: 'REGION' | 'DISTRICT';
  } = this.nouveauRegion();
  communeForm: Omit<CommuneAdmin, 'id' | 'regionNom'> = this.nouvelleCommune();

  readonly regionsResource = rxResource({
    stream: () => this.service.regions(),
    defaultValue: [] as RegionAdmin[],
  });

  readonly communesResource = rxResource({
    stream: () => this.service.communes(),
    defaultValue: [] as CommuneAdmin[],
  });

  readonly regions = computed(() => this.regionsResource.value() ?? []);
  readonly communes = computed(() => this.communesResource.value() ?? []);
  readonly regionsFiltrees = computed(() => {
    const q = this.rechercheRegion().trim().toLocaleLowerCase('fr');
    return this.regions().filter(region =>
      !q || `${region.nom} ${region.codeStable ?? ''} ${region.niveau ?? ''}`.toLocaleLowerCase('fr').includes(q),
    );
  });
  readonly communesDeLaRegion = computed(() => {
    const region = this.regionSelectionnee();
    if (!region) return [];
    const q = this.rechercheCommune().trim().toLocaleLowerCase('fr');
    return this.communes().filter(commune => commune.regionId === region.id)
      .filter(commune => !q || `${commune.nom} ${commune.description ?? ''}`.toLocaleLowerCase('fr').includes(q));
  });

  private nouveauRegion() {
    return { nom: '', description: '', codeStable: '', niveau: 'REGION' as const };
  }

  private nouvelleCommune(): Omit<CommuneAdmin, 'id' | 'regionNom'> {
    return { nom: '', description: '', regionId: '' };
  }

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = (this.regionsResource.error() || this.communesResource.error()) as Error | undefined;
    return err?.message || '';
  }

  nomRegion(id: string): string {
    return this.regions().find(region => region.id === id)?.nom ?? 'Région inconnue';
  }

  ouvrirRegion(region: RegionAdmin): void {
    this.regionSelectionnee.set(region);
    this.rechercheCommune.set('');
    this.actionError.set('');
  }

  revenirAuxTerritoires(): void {
    this.regionSelectionnee.set(null);
    this.rechercheRegion.set('');
    this.actionError.set('');
  }

  ouvrirAjoutRegion(): void {
    this.resetFormulaires();
    this.typeFormulaire.set('region');
    this.modalOuvert.set(true);
  }

  ouvrirAjoutCommune(): void {
    const region = this.regionSelectionnee();
    if (!region) return;
    this.resetFormulaires();
    this.typeFormulaire.set('commune');
    this.communeForm.regionId = region.id;
    this.modalOuvert.set(true);
  }

  editRegion(region: RegionAdmin): void {
    this.resetFormulaires();
    this.typeFormulaire.set('region');
    this.regionEditId.set(region.id);
    this.regionForm = {
      nom: region.nom,
      description: region.description ?? '',
      codeStable: region.codeStable ?? '',
      niveau: region.niveau === 'DISTRICT' || region.codeStable?.startsWith('ML-DIS-') ? 'DISTRICT' : 'REGION',
    };
    this.modalOuvert.set(true);
  }

  editCommune(commune: CommuneAdmin): void {
    this.resetFormulaires();
    this.typeFormulaire.set('commune');
    this.communeEditId.set(commune.id);
    this.communeForm = {
      nom: commune.nom,
      description: commune.description ?? '',
      regionId: commune.regionId,
    };
    this.modalOuvert.set(true);
  }

  fermerModal(): void {
    this.modalOuvert.set(false);
    this.resetFormulaires();
  }

  private resetFormulaires(): void {
    this.regionEditId.set(null);
    this.communeEditId.set(null);
    this.regionForm = this.nouveauRegion();
    this.communeForm = this.nouvelleCommune();
    this.actionError.set('');
  }

  enregistrer(): void {
    if (this.saving()) return;
    if (this.typeFormulaire() === 'region') this.enregistrerRegion();
    else this.enregistrerCommune();
  }

  private enregistrerRegion(): void {
    if (!this.regionForm.nom.trim()) {
      this.actionError.set('Le nom du territoire est obligatoire.');
      return;
    }
    if (!this.regionEditId() && !this.regionForm.codeStable?.trim()) {
      this.actionError.set('Le code stable est obligatoire à la création.');
      return;
    }
    this.saving.set(true);
    const id = this.regionEditId();
    const body = { ...this.regionForm, nom: this.regionForm.nom.trim(), description: this.regionForm.description?.trim() || undefined };
    const request = id ? this.service.modifierRegion(id, body) : this.service.creerRegion(body);
    request.subscribe({
      next: saved => {
        this.message.set(id ? 'Territoire modifié.' : 'Territoire créé.');
        if (this.regionSelectionnee()?.id === id) this.regionSelectionnee.set(saved);
        this.saving.set(false);
        this.fermerModal();
        this.regionsResource.reload();
      },
      error: (error: Error) => {
        this.actionError.set(error.message || 'Impossible d’enregistrer le territoire.');
        this.saving.set(false);
      },
    });
  }

  private enregistrerCommune(): void {
    if (!this.communeForm.nom.trim() || !this.communeForm.regionId) {
      this.actionError.set('Le nom de la commune et sa région sont obligatoires.');
      return;
    }
    this.saving.set(true);
    const id = this.communeEditId();
    const body = { ...this.communeForm, nom: this.communeForm.nom.trim(), description: this.communeForm.description?.trim() || undefined };
    const request = id ? this.service.modifierCommune(id, body) : this.service.creerCommune(body);
    request.subscribe({
      next: () => {
        this.message.set(id ? 'Commune modifiée.' : 'Commune créée.');
        this.saving.set(false);
        this.fermerModal();
        this.communesResource.reload();
      },
      error: (error: Error) => {
        this.actionError.set(error.message || 'Impossible d’enregistrer la commune.');
        this.saving.set(false);
      },
    });
  }

  async deleteRegion(region: RegionAdmin): Promise<void> {
    const ok = await this.confirmation.confirm(
      `Supprimer le territoire « ${region.nom} » ? Vérifiez d’abord qu’aucune commune n’y est rattachée.`,
      { title: 'Supprimer le territoire', confirmLabel: 'Supprimer', danger: true },
    );
    if (!ok) return;
    this.service.supprimerRegion(region.id).subscribe({
      next: () => {
        this.message.set('Territoire supprimé.');
        this.regionsResource.reload();
      },
      error: (error: Error) => this.actionError.set(error.message || 'Suppression refusée. Vérifiez les communes associées.'),
    });
  }

  async deleteCommune(commune: CommuneAdmin): Promise<void> {
    const ok = await this.confirmation.confirm(`Supprimer la commune « ${commune.nom} » ?`, {
      title: 'Supprimer la commune', confirmLabel: 'Supprimer', danger: true,
    });
    if (!ok) return;
    this.service.supprimerCommune(commune.id).subscribe({
      next: () => {
        this.message.set('Commune supprimée.');
        this.communesResource.reload();
      },
      error: (error: Error) => this.actionError.set(error.message || 'Suppression refusée par le serveur.'),
    });
  }
}
