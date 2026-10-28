import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { of, catchError } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { TalentService } from '../../core/services/talent.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { ApiService } from '../../core/services/api.service';
import { Talent, TalentSearchFilters } from '../../shared/models';
import { LibellePipe } from '../../shared/libelle.pipe';

interface Region {
  id: string;
  nom: string;
}

interface Commune {
  id: string;
  nom: string;
  regionId: string;
}

@Component({
  selector: 'app-talent-search',
  standalone: true,
  imports: [LibellePipe, FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './talent-search.component.html',
})
export class TalentSearchComponent {
  private readonly service = inject(TalentService);
  private readonly organisations = inject(OrganisationService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly pageSize = 9;

  private readonly initialQuery = this.route.snapshot.queryParamMap;
  readonly page = signal(Math.max(1, Number(this.initialQuery.get('page') ?? 1) || 1));

  filters: TalentSearchFilters = {
    competence: this.initialQuery.get('competence') ?? '',
    metier: this.initialQuery.get('metier') ?? '',
    regionId: this.initialQuery.get('regionId') ?? '',
    communeId: this.initialQuery.get('communeId') ?? '',
    disponibilite: this.initialQuery.get('disponibilite') ?? '',
    niveauMin: this.initialQuery.get('niveauMin') ?? '',
    q: this.initialQuery.get('q') ?? '',
  };

  readonly selectedRegionId = signal(this.initialQuery.get('regionId') ?? '');
  readonly activeSearch = signal<TalentSearchFilters>({ ...this.filters });

  readonly regionsResource = rxResource({
    stream: () => this.api.get<Region[]>('/api/v1/regions').pipe(catchError(() => of([] as Region[]))),
    defaultValue: [] as Region[],
  });
  readonly regions = computed(() => this.regionsResource.value() ?? []);

  readonly communesResource = rxResource({
    params: () => this.selectedRegionId(),
    stream: ({ params: regionId }) => {
      if (!regionId) return of([] as Commune[]);
      return this.api
        .get<Commune[]>(`/api/v1/communes/region/${regionId}`)
        .pipe(catchError(() => of([] as Commune[])));
    },
    defaultValue: [] as Commune[],
  });
  readonly communes = computed(() => this.communesResource.value() ?? []);

  readonly orgResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });
  readonly checkingAccess = computed(() => this.orgResource.isLoading());
  readonly statutOrganisation = computed(() => this.orgResource.value()?.statut ?? '');

  readonly blockedReason = computed(() => {
    if (this.checkingAccess()) return '';
    const org = this.orgResource.value();
    if (!org || org.statut !== 'APPROUVEE') {
      return 'Votre organisation doit être validée par le serveur avant toute recherche de talents.';
    }
    return '';
  });

  readonly searchResource = rxResource({
    params: () => ({
      orgStatut: this.statutOrganisation(),
      filters: this.activeSearch(),
    }),
    stream: ({ params }) => {
      if (params.orgStatut !== 'APPROUVEE') {
        return of([] as Talent[]);
      }
      return this.service.rechercher(params.filters);
    },
    defaultValue: [] as Talent[],
  });

  readonly loading = computed(() => this.searchResource.isLoading());

  readonly error = computed(() => {
    const orgErr = this.orgResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (orgErr)
      return (
        orgErr.error?.message ??
        orgErr.message ??
        'Impossible de vérifier le statut de validation de l’organisation.'
      );
    const sErr = this.searchResource.error() as
      | { error?: { message?: string }; message?: string }
      | undefined;
    if (sErr) return sErr.error?.message ?? sErr.message ?? 'La recherche a échoué.';
    return '';
  });

  readonly resultats = computed(() => this.searchResource.value() ?? []);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.resultats().length / this.pageSize)));
  readonly visibleResults = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.resultats().slice(start, start + this.pageSize);
  });

  onRegionChange(regionId: string): void {
    this.filters.regionId = regionId;
    this.filters.communeId = '';
    this.selectedRegionId.set(regionId);
  }

  resetFilters(): void {
    this.filters = {
      competence: '',
      metier: '',
      regionId: '',
      communeId: '',
      disponibilite: '',
      niveauMin: '',
      q: '',
    };
    this.selectedRegionId.set('');
    this.applyFilters();
  }

  applyFilters(): void {
    this.page.set(1);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...this.filters, page: 1 },
      queryParamsHandling: 'merge',
    });
    this.activeSearch.set({ ...this.filters });
  }

  search(): void {
    this.applyFilters();
  }

  reessayer(): void {
    this.orgResource.reload();
    this.searchResource.reload();
  }

  goPage(next: number): void {
    const target = Math.max(1, Math.min(this.pageCount(), next));
    this.page.set(target);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: target },
      queryParamsHandling: 'merge',
    });
  }
}
