import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { PageHeaderComponent } from '../../shared/components';
import { TalentService } from '../../core/services/talent.service';
import { Talent, TalentSearchFilters } from '../../shared/models';

@Component({
  selector: 'app-talents-page',
  standalone: true,
  imports: [FormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './talents-page.component.html',
})
export class TalentsPageComponent {
  private readonly service = inject(TalentService);

  readonly filters: TalentSearchFilters = {
    competence: '',
    metier: '',
    localisation: '',
    disponibilite: '',
  };

  readonly activeFilters = signal<TalentSearchFilters | null>(null);

  readonly talentsResource = rxResource({
    params: () => this.activeFilters(),
    stream: ({ params }) => {
      if (!params) return of([] as Talent[]);
      return this.service.rechercher(params);
    },
    defaultValue: [] as Talent[],
  });

  readonly resultats = computed(() => this.talentsResource.value() ?? []);
  readonly loading = computed(() => this.talentsResource.isLoading());
  readonly error = computed(() => {
    const err = this.talentsResource.error() as { message?: string } | undefined;
    return err?.message ?? '';
  });

  rechercher(): void {
    this.activeFilters.set({ ...this.filters });
  }
}
