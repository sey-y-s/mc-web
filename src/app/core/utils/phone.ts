const MALI = /^(?:\+?223|00223)?(\d{8})$/;

// +223 suivi de 8 chiffres. null si invalide.
export function normalizeMaliPhone(input: string): string | null {
  const compact = input.replace(/[\s.\-()]/g, '');
  const match = MALI.exec(compact);
  return match ? `+223${match[1]}` : null;
}

// Distingue un numéro d'un e-mail dans le champ Identifiant.
export function looksLikePhone(input: string): boolean {
  return /^[+\d][\d\s.\-()]*$/.test(input.trim());
}