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
        Les paramètres ne sont pas modifiables pour le moment : le backend ne dispose pas encore
        d’un stockage ni d’API pour les paramètres globaux. Aucune valeur locale ne sera enregistrée
        comme si elle provenait du serveur.
      </p>
    </section>
  `,
})
export class PlatformSettingsComponent {}
