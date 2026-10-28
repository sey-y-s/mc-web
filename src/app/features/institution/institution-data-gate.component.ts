import { Component, input } from '@angular/core';

@Component({
  selector: 'app-institution-data-gate',
  standalone: true,
  template: `
    <section class="mc-card space-y-4 p-6" aria-labelledby="institution-gate-title">
      <div class="flex items-start gap-3">
        <span aria-hidden="true" class="text-2xl">🔒</span>
        <div>
          <h2 id="institution-gate-title" class="text-lg font-semibold">{{ title() }}</h2>
          <p class="mc-muted mt-2">{{ description() }}</p>
        </div>
      </div>
      <div class="alert alert-warning text-gray-100 rounded-md" role="status">
        <div>
          <p class="font-semibold">Accès indisponible</p>
          <p class="mt-1 text-sm">Votre compte ne dispose pas actuellement de l’autorisation nécessaire pour consulter ces indicateurs.</p>
        </div>
      </div>
      <ul class="list-disc space-y-1 pl-5 text-sm">
        <li>Autorisation INSTITUTION vérifiée côté serveur sur chaque endpoint.</li>
        <li>Agrégation et suppression des cellules d’effectif inférieur à 5, y compris les suppressions complémentaires.</li>
        <li>Protection contre le recoupement entre filtres, périodes, régions et exports.</li>
        <li>Contrat documenté pour les périodes, la provenance et les règles de calcul des indicateurs.</li>
      </ul>
    </section>
  `,
})
export class InstitutionDataGateComponent {
  title = input.required<string>();
  description = input.required<string>();
}
