import { Component, computed, effect, inject, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

interface Territoire { id: string; nom: string; niveau?: string }
interface CommuneRef { id: string; nom: string; regionId: string }

type Portee = 'NATIONAL' | 'REGION' | 'COMMUNE';

/**
 * Zone géographique d'un besoin (consignes V1.2) : tout le Mali, une région ou une commune.
 * Choix progressif : une fois la portée choisie, seuls les champs utiles s'affichent.
 * Pour les statistiques, un besoin est compté une seule fois, dans sa zone la plus précise.
 */
@Component({
  selector: 'app-zone-besoin',
  standalone: true,
  imports: [FormsModule],
  template: `
    <fieldset class="rounded-xl border border-base-300 p-4">
      <legend class="px-1 font-semibold">Où cherchez-vous ces talents ?</legend>
      <div class="mt-1 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Portée du besoin">
        @for (p of portees; track p.code) {
          <button type="button" role="radio" [attr.aria-checked]="portee() === p.code"
                  [class]="portee() === p.code ? 'rounded-lg border border-primary bg-base-200 p-3 text-left' : 'rounded-lg border border-base-300 p-3 text-left transition hover:border-primary'"
                  (click)="choisir(p.code)">
            <span class="block text-sm font-semibold">{{ p.libelle }}</span>
            <span class="block text-xs text-base-content/65">{{ p.aide }}</span>
          </button>
        }
      </div>
      @if (portee() !== 'NATIONAL') {
        <div class="mt-3 grid gap-3 sm:grid-cols-2 mc-etape">
          <label class="block"><span class="mc-label">Région</span>
            <select class="mc-select" [ngModel]="regionId() ?? ''" (ngModelChange)="changerRegion($event)" name="zoneRegion">
              <option value="">Choisir la région</option>
              @for (r of regions(); track r.id) { <option [value]="r.id">{{ r.nom }}</option> }
            </select>
          </label>
          @if (portee() === 'COMMUNE') {
            <label class="block"><span class="mc-label">Commune</span>
              <select class="mc-select" [ngModel]="communeId() ?? ''" (ngModelChange)="communeId.set($event || null)" name="zoneCommune" [disabled]="!regionId()">
                <option value="">{{ regionId() ? 'Choisir la commune' : 'Choisissez d’abord la région' }}</option>
                @for (c of communes(); track c.id) { <option [value]="c.id">{{ c.nom }}</option> }
              </select>
            </label>
          }
        </div>
      }
      <p class="mt-2 text-xs text-base-content/60">{{ resume() }}</p>
    </fieldset>
  `,
})
export class ZoneBesoinComponent {
  private readonly api = inject(ApiService);

  readonly regionId = model<string | null>(null);
  readonly communeId = model<string | null>(null);
  readonly portee = signal<Portee>('NATIONAL');

  readonly portees: Array<{ code: Portee; libelle: string; aide: string }> = [
    { code: 'NATIONAL', libelle: 'Tout le Mali', aide: 'Talents de toutes les localités' },
    { code: 'REGION', libelle: 'Une région', aide: 'Région ou district de Bamako' },
    { code: 'COMMUNE', libelle: 'Une commune', aide: 'Talents d’une commune précise' },
  ];

  private readonly regionsRes = rxResource({ stream: () => this.api.get<Territoire[]>('/api/v1/regions'), defaultValue: [] as Territoire[] });
  readonly regions = computed(() => [...(this.regionsRes.value() ?? [])].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));

  private readonly communesRes = rxResource({
    params: () => this.regionId(),
    stream: ({ params }) => (params ? this.api.get<CommuneRef[]>(`/api/v1/communes/region/${params}`) : of([] as CommuneRef[])),
    defaultValue: [] as CommuneRef[],
  });
  readonly communes = computed(() => [...(this.communesRes.value() ?? [])].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));

  private initialise = false;

  constructor() {
    // La portée affichée suit les valeurs reçues (modification d'un besoin existant).
    effect(() => {
      const c = this.communeId();
      const r = this.regionId();
      if (this.initialise) return;
      if (c) { this.portee.set('COMMUNE'); this.initialise = true; }
      else if (r) { this.portee.set('REGION'); this.initialise = true; }
    });
  }

  choisir(p: Portee): void {
    this.initialise = true;
    this.portee.set(p);
    if (p === 'NATIONAL') { this.regionId.set(null); this.communeId.set(null); }
    if (p === 'REGION') this.communeId.set(null);
  }

  changerRegion(id: string): void {
    this.initialise = true;
    this.regionId.set(id || null);
    this.communeId.set(null);
  }

  resume(): string {
    const r = this.regions().find((x) => x.id === this.regionId())?.nom;
    const c = this.communes().find((x) => x.id === this.communeId())?.nom;
    if (this.portee() === 'NATIONAL') return 'Le besoin concerne tout le Mali.';
    if (this.portee() === 'REGION') return r ? `Le besoin concerne la région ${r}.` : 'Choisissez la région.';
    return c ? `Le besoin concerne la commune ${c}${r ? ` (${r})` : ''}.` : 'Choisissez la région puis la commune.';
  }
}
