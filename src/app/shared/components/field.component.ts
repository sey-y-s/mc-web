import { Component, input } from '@angular/core';

/**
 * Champ de formulaire : libellé, contrôle (projeté), aide et erreur.
 * Le contrôle projeté doit porter [id]="fieldId", aria-describedby="{{fieldId}}-aide {{fieldId}}-erreur"
 * et [attr.aria-invalid]="erreur ? 'true' : null".
 */
@Component({
  selector: 'mc-field',
  standalone: true,
  templateUrl: './field.component.html',
})
export class FieldComponent {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly hint = input('');
  readonly error = input('');
  readonly optional = input(false);
}
