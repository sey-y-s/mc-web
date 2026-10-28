import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';
import { CarteMaliTalentsComponent } from './carte-mali-talents.component';

/** Page « Carte des talents » : carte dynamique du Mali, accessible depuis le menu. */
@Component({
  selector: 'app-carte-talents-page',
  standalone: true,
  imports: [PageHeaderComponent, CarteMaliTalentsComponent],
  template: `
    <mc-page-header
      title="Carte des talents"
      description="Visualisez sur la carte du Mali tous les talents recensés, par région et par commune. Filtrez par compétence, région ou disponibilité."
    />
    <mc-carte-mali-talents />
  `,
})
export class CarteTalentsPageComponent {}
