import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { MiseEnRelationService } from '../../core/services/mise-en-relation.service';
import { DemandeMiseEnRelation } from '../../shared/models';

@Component({
  selector: 'app-mise-en-relation-page',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './mise-en-relation-page.component.html',
})
export class MiseEnRelationPageComponent {
  private readonly service = inject(MiseEnRelationService);

  readonly demandesResource = rxResource({
    stream: () => this.service.lister(),
    defaultValue: [] as DemandeMiseEnRelation[],
  });

  readonly demandes = computed(() => this.demandesResource.value() ?? []);
  readonly loading = computed(() => this.demandesResource.isLoading());
  readonly error = computed(() => {
    const err = this.demandesResource.error() as { message?: string } | undefined;
    return err?.message ?? '';
  });

  readonly enAttente = computed(
    () => this.demandes().filter((demande) => demande.statut === 'EN_ATTENTE').length
  );

  readonly acceptees = computed(
    () => this.demandes().filter((demande) => demande.statut === 'ACCEPTEE').length
  );

  readonly refusees = computed(
    () => this.demandes().filter((demande) => demande.statut === 'REFUSEE').length
  );
}
