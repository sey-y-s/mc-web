import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { AdminService, CommuneAdmin, RegionAdmin } from '../../core/services/admin.service';
import { MaliMapComponent } from '../dashboard/mali-map.component';
import { ConfirmationService } from '../../core/ui/confirmation.service';

@Component({
  selector: 'app-territoires-admin',
  standalone: true,
  imports: [FormsModule, PageHeaderComponent, MaliMapComponent],
  templateUrl: './territoires-admin.component.html',
})
export class TerritoiresAdminComponent {
  private readonly service = inject(AdminService);
  private readonly confirmation = inject(ConfirmationService);

  readonly tab = signal<'regions' | 'communes'>('regions');
  readonly rechercheRegion = signal('');
  readonly rechercheCommune = signal('');
  readonly pageRegions = signal(1);
  readonly pageCommunes = signal(1);
  readonly pageSize = 5;
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
  } = {
      nom: '',
      description: '',
      codeStable: '',
      niveau: 'REGION',
    };
  communeForm: Omit<CommuneAdmin, 'id' | 'regionNom'> = { nom: '', description: '', regionId: '' };

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
    const q = this.rechercheRegion().trim().toLocaleLowerCase();
    return this.regions().filter(
      (r) =>
        !q || `${r.nom} ${r.codeStable ?? ''} ${r.niveau ?? ''}`.toLocaleLowerCase().includes(q),
    );
  });

  readonly totalPagesRegions = computed(() =>
    Math.max(1, Math.ceil(this.regionsFiltrees().length / this.pageSize)),
  );

  readonly regionsFiltreesPage = computed(() => {
    const page = Math.min(this.pageRegions(), this.totalPagesRegions());
    return this.regionsFiltrees().slice((page - 1) * this.pageSize, page * this.pageSize);
  });

  readonly communesFiltrees = computed(() => {
    const q = this.rechercheCommune().trim().toLocaleLowerCase();
    return this.communes().filter(
      (c) =>
        !q ||
        `${c.nom} ${c.regionNom ?? this.nomRegion(c.regionId)}`.toLocaleLowerCase().includes(q),
    );
  });

  readonly totalPagesCommunes = computed(() =>
    Math.max(1, Math.ceil(this.communesFiltrees().length / this.pageSize)),
  );

  readonly communesFiltreesPage = computed(() => {
    const page = Math.min(this.pageCommunes(), this.totalPagesCommunes());
    return this.communesFiltrees().slice((page - 1) * this.pageSize, page * this.pageSize);
  });

  errorMessage(): string {
    if (this.actionError()) return this.actionError();
    const err = (this.regionsResource.error() || this.communesResource.error()) as
      Error | undefined;
    return err?.message || '';
  }

  nomRegion(id: string): string {
    return this.regions().find((r) => r.id === id)?.nom ?? 'Région inconnue';
  }

  reset(): void {
    this.regionEditId.set(null);
    this.communeEditId.set(null);
    this.regionForm = { nom: '', description: '', codeStable: '', niveau: 'REGION' };
    this.communeForm = { nom: '', description: '', regionId: '' };
  }

  editRegion(r: RegionAdmin): void {
    this.regionEditId.set(r.id);
    this.regionForm = {
      nom: r.nom,
      description: r.description ?? '',
      codeStable: r.codeStable ?? '',
      niveau:
        r.niveau === 'DISTRICT' || r.codeStable?.startsWith('ML-DIS-') ? 'DISTRICT' : 'REGION',
    };
    this.allerEditeur();
  }

  editCommune(c: CommuneAdmin): void {
    this.communeEditId.set(c.id);
    this.communeForm = {
      nom: c.nom,
      description: c.description ?? '',
      regionId: c.regionId,
    };
    this.allerEditeur();
  }

  private allerEditeur(): void {
    requestAnimationFrame(() =>
      document.getElementById('territoire-editor')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      }),
    );
  }

  enregistrerRegion(): void {
    if (!this.regionForm.nom.trim()) {
      this.actionError.set('Le nom du territoire est obligatoire.');
      return;
    }
    if (!this.regionEditId() && !this.regionForm.codeStable?.trim()) {
      this.actionError.set('Le code stable est obligatoire à la création.');
      return;
    }
    this.saving.set(true);
    this.actionError.set('');
    const editId = this.regionEditId();
    const obs = editId
      ? this.service.modifierRegion(editId, this.regionForm)
      : this.service.creerRegion(this.regionForm);
    obs.subscribe({
      next: () => {
        this.message.set('Territoire enregistré.');
        this.reset();
        this.saving.set(false);
        this.regionsResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible d’enregistrer la région.');
        this.saving.set(false);
      },
    });
  }

  enregistrerCommune(): void {
    if (!this.communeForm.nom.trim() || !this.communeForm.regionId) {
      this.actionError.set('Le nom et la région sont obligatoires.');
      return;
    }
    this.saving.set(true);
    this.actionError.set('');
    const editId = this.communeEditId();
    const obs = editId
      ? this.service.modifierCommune(editId, this.communeForm)
      : this.service.creerCommune(this.communeForm);
    obs.subscribe({
      next: () => {
        this.message.set('Commune enregistrée.');
        this.reset();
        this.saving.set(false);
        this.communesResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Impossible d’enregistrer la commune.');
        this.saving.set(false);
      },
    });
  }

  async deleteRegion(r: RegionAdmin): Promise<void> {
    const ok = await this.confirmation.confirm(`Supprimer la région « ${r.nom} » ? Vérifiez d’abord les communes qui lui sont rattachées.`, { title: 'Supprimer la région', confirmLabel: 'Supprimer', danger: true });
    if (!ok) return;
    this.service.supprimerRegion(r.id).subscribe({
      next: () => {
        this.message.set('Région supprimée.');
        this.regionsResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Suppression refusée. Vérifiez les communes associées.');
      },
    });
  }

  async deleteCommune(c: CommuneAdmin): Promise<void> {
    const ok = await this.confirmation.confirm(`Supprimer la commune « ${c.nom} » ?`, { title: 'Supprimer la commune', confirmLabel: 'Supprimer', danger: true });
    if (!ok) return;
    this.service.supprimerCommune(c.id).subscribe({
      next: () => {
        this.message.set('Commune supprimée.');
        this.communesResource.reload();
      },
      error: (e: Error) => {
        this.actionError.set(e.message || 'Suppression refusée par le serveur.');
      },
    });
  }
}
