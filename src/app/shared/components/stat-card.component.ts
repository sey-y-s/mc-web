import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Chiffre clé. Une valeur absente ou masquée (petit effectif) s'affiche « — » avec un contour en pointillés :
 * elle n'est jamais présentée comme un zéro (cahier des charges §4.14).
 */
@Component({
  selector: 'mc-stat-card',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './stat-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input<number | string | null>(null);
  readonly hint = input('');
  /** true : valeur masquée pour protéger les personnes (petit effectif). */
  readonly masque = input(false);
  /** Jauge graduée de 0 à 100 (facultatif). */
  readonly jauge = input<number | null>(null);
  /** Route de destination : la carte devient un lien (facultatif). */
  readonly lien = input<string | null>(null);

  /** Ton de la valeur : ocre = pénurie, bleu = excédent. Toujours à doubler d'un texte d'aide. */
  readonly ton = input<'normal' | 'penurie' | 'excedent'>('normal');

  readonly classeValeur = computed(() =>
    this.sansDonnee() ? 'text-gray-500' : this.ton() === 'penurie' ? 'text-ocre-700' : this.ton() === 'excedent' ? 'text-brand-700' : '',
  );
  readonly sansDonnee = computed(() => this.masque() || this.value() === null);
  readonly affichage = computed(() => {
    const v = this.value();
    if (this.sansDonnee()) return '—';
    return typeof v === 'number' ? v.toLocaleString('fr-FR') : String(v);
  });
  readonly explication = computed(() =>
    this.masque() ? 'Effectif trop faible pour être affiché.' : this.value() === null ? 'Donnée non disponible.' : '',
  );
}
