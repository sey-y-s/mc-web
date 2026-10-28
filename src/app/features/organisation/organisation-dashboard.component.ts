import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { rxResource } from '@angular/core/rxjs-interop';
import { PageHeaderComponent, DonutChartComponent, ChartSegment, MC_CHART } from '../../shared/components';
import { CarteMaliTalentsComponent } from '../carte/carte-mali-talents.component';
import { NotificationService } from '../../core/services/notification.service';
import { OrganisationService } from '../../core/services/organisation.service';
import { BesoinService } from '../../core/services/besoin.service';
import { MiseEnRelationService } from '../../core/services/mise-en-relation.service';
import { Besoin, Notification, Organisation } from '../../shared/models';
import { LibellePipe } from '../../shared/libelle.pipe';

@Component({
  selector: 'app-organisation-dashboard',
  standalone: true,
  imports: [LibellePipe, DatePipe, PageHeaderComponent, RouterLink, CarteMaliTalentsComponent, DonutChartComponent],
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

  /** Taux d'acceptation des demandes ayant reçu une réponse (null s'il n'y en a aucune). */
  readonly tauxAcceptation = computed(() => {
    const list = this.relationsResource.value() ?? [];
    const repondues = list.filter((r) => r.statut === 'ACCEPTEE' || r.statut === 'REFUSEE').length;
    return repondues ? Math.round((this.acceptees() / repondues) * 100) : null;
  });

  /** Anneau : besoins par statut. */
  segmentsBesoins(stats: { besoinsBrouillon: number; besoinsOuverts: number; besoinsClotures: number }): ChartSegment[] {
    return [
      { label: 'Ouverts', value: stats.besoinsOuverts ?? 0, color: MC_CHART.vert },
      { label: 'Brouillons', value: stats.besoinsBrouillon ?? 0, color: MC_CHART.gris },
      { label: 'Clôturés', value: stats.besoinsClotures ?? 0, color: MC_CHART.or },
    ];
  }

  /** Anneau : réponses des citoyens aux demandes de mise en relation. */
  readonly segmentsRelations = computed<ChartSegment[]>(() => {
    const list = this.relationsResource.value() ?? [];
    const n = (st: string) => list.filter((r) => r.statut === st).length;
    return [
      { label: 'Acceptées', value: n('ACCEPTEE'), color: MC_CHART.vert },
      { label: 'En attente', value: n('EN_ATTENTE'), color: MC_CHART.or },
      { label: 'Refusées', value: n('REFUSEE'), color: MC_CHART.rouge },
    ];
  });

  /** Part (en %) d'un statut dans l'ensemble des besoins. */
  partBesoins(stats: { besoinsBrouillon: number; besoinsOuverts: number; besoinsClotures: number }, valeur: number): number {
    const total = (stats.besoinsBrouillon ?? 0) + (stats.besoinsOuverts ?? 0) + (stats.besoinsClotures ?? 0);
    return total ? Math.round((valeur / total) * 100) : 0;
  }

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
