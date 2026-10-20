import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { OrganisationService } from '../../core/services/organisation.service';
import { Organisation } from '../../shared/models';

@Component({
  selector: 'app-organisations-page',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './organisations-page.component.html',
})
export class OrganisationsPageComponent {
  private readonly service = inject(OrganisationService);

  readonly filter = signal<'ALL' | 'EN_ATTENTE' | 'APPROUVEE' | 'SUSPENDUE'>('ALL');

  readonly organisationsResource = rxResource({
    stream: () => this.service.lister(),
    defaultValue: [] as Organisation[],
  });

  readonly organisations = computed(() => this.organisationsResource.value() ?? []);
  readonly loading = computed(() => this.organisationsResource.isLoading());
  readonly error = computed(() => {
    const err = this.organisationsResource.error() as { message?: string } | undefined;
    return err?.message ?? '';
  });

  readonly filteredOrganisations = computed(() => {
    const f = this.filter();
    const list = this.organisations();
    if (f === 'ALL') return list;
    return list.filter((item) => item.statut === f);
  });
}
