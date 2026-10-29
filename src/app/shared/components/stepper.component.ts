import { Component, computed, input, output } from '@angular/core';

/** Étapes d'un parcours : losanges (plein = fait, cerclé = en cours, pointillé = à venir). On ne peut revenir qu'en arrière. */
@Component({
  selector: 'mc-stepper',
  standalone: true,
  templateUrl: './stepper.component.html',
})
export class StepperComponent {
  readonly steps = input.required<readonly string[]>();
  /** Index de l'étape en cours (à partir de 0). */
  readonly current = input.required<number>();
  readonly stepSelected = output<number>();

  readonly libelleCourant = computed(() => this.steps()[this.current()] ?? '');

  etat(i: number): 'fait' | 'en-cours' | 'a-venir' {
    return i < this.current() ? 'fait' : i === this.current() ? 'en-cours' : 'a-venir';
  }

  texteAccessible(i: number): string {
    const e = this.etat(i);
    const suffixe = e === 'fait' ? ', terminée' : e === 'en-cours' ? ', en cours' : ', à venir';
    return `Étape ${i + 1} sur ${this.steps().length} : ${this.steps()[i]}${suffixe}`;
  }
}
