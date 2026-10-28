import { Component, computed, input } from '@angular/core';
import { LibellePipe } from '../libelle.pipe';

type Famille = 'verifie' | 'en-cours' | 'rejete' | 'attention' | 'brouillon' | 'neutre';

const FAMILLES: Record<string, Famille> = {
  // abouti / actif
  VALIDE: 'verifie', VERIFIEE: 'verifie', VALIDEE: 'verifie', APPROUVE: 'verifie', APPROUVEE: 'verifie', OUVERT: 'verifie', ACTIF: 'verifie',
  PUBLIE: 'verifie', PUBLIEE: 'verifie', ACCEPTEE: 'verifie', DISPONIBLE: 'verifie', RETENUE: 'verifie', SUCCESS: 'verifie', SUCCES: 'verifie',
  // en attente de traitement
  EN_COURS: 'en-cours', EN_ATTENTE: 'en-cours',
  // refusé / échec
  REJETE: 'rejete', REJETEE: 'rejete', REFUSEE: 'rejete', NON_VALIDE: 'rejete', NON_RETENUE: 'rejete', ECHEC: 'rejete', FAILURE: 'rejete',
  // à surveiller
  SUSPENDU: 'attention', A_REVALIDER: 'attention', SUSPENDUE: 'attention', EXPIREE: 'attention', ALERTE: 'attention', INDISPONIBLE: 'attention', DEPUBLIEE: 'attention',
  // pas encore engagé
  BROUILLON: 'brouillon', DECLAREE: 'brouillon', NON_VERIFIEE: 'brouillon',
};

const CLASSES: Record<Famille, string> = {
  verifie: 'etat-verifiee',
  'en-cours': 'etat-en-cours',
  rejete: 'etat-rejetee',
  attention: 'etat-a-revalider',
  brouillon: 'etat-declaree',
  neutre: 'border border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300',
};

/** Badge d'état : forme du contour + icône + libellé. Jamais la couleur seule. */
@Component({
  selector: 'mc-status-badge',
  standalone: true,
  imports: [LibellePipe],
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  value = input.required<string>();
  readonly famille = computed<Famille>(() => FAMILLES[String(this.value()).trim().toUpperCase()] ?? 'neutre');
  readonly classes = computed(() => CLASSES[this.famille()]);
}
