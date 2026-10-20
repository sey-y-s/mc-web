import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent } from '../../shared/components';
import { NotificationService } from '../../core/services/notification.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { BesoinService } from '../../core/services/besoin.service';
import { MiseEnRelationService } from '../../core/services/mise-en-relation.service';
import { Besoin, Notification, Organisation } from '../../shared/models';

@Component({
  selector: 'app-organisation-dashboard',
  standalone: true,
  imports: [DatePipe, PageHeaderComponent, RouterLink],
  templateUrl: './organisation-dashboard.component.html',
})
export class OrganisationDashboardComponent {
  private readonly organisations = inject(OrganisationService);
  private readonly besoinsService = inject(BesoinService);
  private readonly relationsService = inject(MiseEnRelationService);
  private readonly notificationsService = inject(NotificationService);

  readonly profileResource = rxResource({
    stream: () => this.organisations.obtenirPourUtilisateur(),
  });

  readonly besoinsResource = rxResource({
    stream: () => this.besoinsService.lister(),
    defaultValue: [] as Besoin[],
  });

  readonly statutsBesoinsResource = rxResource({
    stream: () => this.besoinsService.tableauDeBordOrganisation(),
  });

  readonly relationsResource = rxResource({
    stream: () => this.relationsService.lister(),
    defaultValue: [],
  });

  readonly notificationsResource = rxResource({
    stream: () => this.notificationsService.listerNonLues(),
    defaultValue: [] as Notification[],
  });

  readonly besoinsOuverts = computed(() => {
    const list = this.besoinsResource.value();
    return list ? list.filter((b) => b.statut === 'OUVERT').length : null;
  });

  readonly derniersBesoins = computed(() => {
    return [...(this.besoinsResource.value() ?? [])]
      .sort((a, b) => (b.dateCreation || '').localeCompare(a.dateCreation || ''))
      .slice(0, 3);
  });

  readonly enAttente = computed(() => {
    return this.relationsResource.value()?.filter((r) => r.statut === 'EN_ATTENTE').length ?? 0;
  });

  readonly acceptees = computed(() => {
    return this.relationsResource.value()?.filter((r) => r.statut === 'ACCEPTEE').length ?? 0;
  });

  errorMessage(error: unknown): string {
    if (!error) return '';
    const err = error as { error?: { message?: string }; message?: string };
    return err.error?.message ?? err.message ?? 'Données indisponibles.';
  }

  actualiser(): void {
    this.profileResource.reload();
    this.besoinsResource.reload();
    this.statutsBesoinsResource.reload();
    this.relationsResource.reload();
    this.notificationsResource.reload();
  }
}
