import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { normalizeMaliPhone } from '../core/utils/phone';

export const maliPhoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  return value === '' || normalizeMaliPhone(value) ? null : { maliPhone: true };
};

// Validateur de groupe : deux champs doivent avoir la même valeur.
export function sameValue(a: string, b: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null =>
    group.get(a)?.value === group.get(b)?.value ? null : { mismatch: true };
}