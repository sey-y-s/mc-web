/** Defensive display helpers for institution-only aggregate indicators. Backend suppression remains mandatory. */
export interface PrivacyAwareAggregate {
  value: number | null | undefined;
  effectif?: number | null;
  suppressed?: boolean;
}

export interface AggregateDisplay {
  text: string;
  reason: string | null;
  visible: boolean;
}

export function aggregateDisplay(row: PrivacyAwareAggregate): AggregateDisplay {
  if (row.suppressed) return { text: '—', reason: 'valeur masquée pour protéger la confidentialité', visible: false };
  if (row.effectif == null || !Number.isFinite(row.effectif)) {
    return { text: '—', reason: 'confidentialité non confirmée', visible: false };
  }
  if (row.effectif < 5) return { text: '—', reason: 'effectif trop faible', visible: false };
  if (row.value == null || !Number.isFinite(row.value)) {
    return { text: '—', reason: 'valeur indisponible', visible: false };
  }
  return { text: new Intl.NumberFormat('fr-FR').format(row.value), reason: null, visible: true };
}

/** Never use this helper as a substitute for server-side anti-differencing controls. */
export function canExportAggregate(row: PrivacyAwareAggregate, backendPrivacyApproved: boolean): boolean {
  return backendPrivacyApproved === true
    && row.suppressed !== true
    && row.effectif != null
    && Number.isFinite(row.effectif)
    && row.effectif >= 5
    && row.value != null
    && Number.isFinite(row.value);
}
