import { Component } from '@angular/core';
import { PageHeaderComponent } from '../../shared/components';

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <mc-page-header title="Paramètres plateforme" description="Gérer les paramètres globaux de la plateforme." />
    <section class="mc-card p-6">
      <p class="text-sm text-amber-800" role="status">
        Aucun paramètre global n’est disponible.
      </p>
    </section>
  `,
})
export class PlatformSettingsComponent {}
