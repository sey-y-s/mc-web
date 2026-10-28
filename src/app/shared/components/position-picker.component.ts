import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, effect, inject, input, output, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { MaliBaseMap, repereLieu } from '../../core/geo/mali-base-map';
import { GeolocalisationService } from '../../core/services/geolocalisation.service';

/**
 * Sélection d'une position : GPS de l'appareil ou clic sur la carte, puis enregistrement.
 * Le parent reçoit la position choisie via (enregistrer) et la suppression via (effacer).
 */
@Component({
  selector: 'mc-position-picker',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <button class="btn btn-sm btn-primary" type="button" (click)="localiser()" [disabled]="localisation() || busy()">
          {{ localisation() ? 'Localisation…' : 'Utiliser ma position actuelle' }}
        </button>
        <span class="text-sm text-base-content/60">ou cliquez sur la carte pour placer le repère.</span>
        <label class="ml-auto flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" class="toggle toggle-sm toggle-primary" [checked]="fond()" (change)="basculerFond()" />
          Fond détaillé
        </label>
      </div>
      @if (erreur()) { <div class="alert alert-warning py-2 text-sm" role="alert">{{ erreur() }}</div> }
      <div #carte class="h-80 w-full rounded-lg border border-base-300" role="region" [attr.aria-label]="ariaLabel()"></div>
      <div class="flex flex-wrap items-center gap-3">
        @if (choix(); as c) {
          <span class="text-sm tabular-nums">Position : {{ c.latitude | number: '1.5-5' }}, {{ c.longitude | number: '1.5-5' }}</span>
        } @else {
          <span class="text-sm text-base-content/60">Aucune position définie.</span>
        }
        <div class="ml-auto flex flex-wrap gap-2">
          @if (modifiee()) {
            <button class="btn btn-sm btn-primary" type="button" (click)="valider()" [disabled]="busy()">{{ busy() ? 'Enregistrement…' : 'Enregistrer la position' }}</button>
          }
          @if (latitude() !== null && !modifiee()) {
            <button class="btn btn-sm btn-ghost" type="button" (click)="effacer.emit()" [disabled]="busy()">{{ libelleEffacer() }}</button>
          }
        </div>
      </div>
    </div>
  `,
})
export class PositionPickerComponent implements AfterViewInit, OnDestroy {
  readonly latitude = input<number | null>(null);
  readonly longitude = input<number | null>(null);
  readonly busy = input(false);
  readonly ariaLabel = input('Carte de sélection de la position');
  readonly libelleEffacer = input('Retirer la position');
  readonly enregistrer = output<{ latitude: number; longitude: number }>();
  readonly effacer = output<void>();

  @ViewChild('carte', { static: true }) carteRef!: ElementRef<HTMLDivElement>;

  private readonly http = inject(HttpClient);
  private readonly geo = inject(GeolocalisationService);
  private base?: MaliBaseMap;
  private repere?: L.Marker;

  readonly choix = signal<{ latitude: number; longitude: number } | null>(null);
  readonly modifiee = signal(false);
  readonly localisation = signal(false);
  readonly erreur = signal('');
  readonly fond = signal(false);

  constructor() {
    // Position enregistrée reçue du parent.
    effect(() => {
      const lat = this.latitude();
      const lng = this.longitude();
      this.modifiee.set(false);
      this.choix.set(lat !== null && lng !== null ? { latitude: lat, longitude: lng } : null);
      this.placer(true);
    });
  }

  ngAfterViewInit(): void {
    this.base = new MaliBaseMap(this.carteRef.nativeElement, this.http);
    this.base.map.on('click', (e: L.LeafletMouseEvent) => this.choisir(e.latlng.lat, e.latlng.lng, false));
    this.placer(true);
    this.base.invalider();
  }

  async localiser(): Promise<void> {
    this.erreur.set('');
    this.localisation.set(true);
    try {
      const p = await this.geo.positionNavigateur();
      this.choisir(p.latitude, p.longitude, true);
    } catch (e) {
      this.erreur.set((e as Error).message);
    } finally {
      this.localisation.set(false);
    }
  }

  basculerFond(): void {
    this.fond.update((v) => !v);
    this.base?.fondDetaille(this.fond());
  }

  valider(): void {
    const c = this.choix();
    if (c) this.enregistrer.emit(c);
  }

  private choisir(latitude: number, longitude: number, centrer: boolean): void {
    this.erreur.set('');
    this.choix.set({ latitude, longitude });
    this.modifiee.set(true);
    this.placer(centrer);
  }

  private placer(centrer: boolean): void {
    if (!this.base) return;
    const c = this.choix();
    if (!c) {
      if (this.repere) { this.base.map.removeLayer(this.repere); this.repere = undefined; }
      return;
    }
    const ll = L.latLng(c.latitude, c.longitude);
    if (this.repere) this.repere.setLatLng(ll);
    else this.repere = L.marker(ll, { icon: repereLieu(), keyboard: false }).addTo(this.base.map);
    if (centrer) this.base.map.setView(ll, Math.max(this.base.map.getZoom(), this.fond() ? 13 : 8));
  }

  ngOnDestroy(): void {
    this.base?.detruire();
  }
}
