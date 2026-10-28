/**
 * Identité juridique des organisations au Mali : natures juridiques, numéros officiels et pièces justificatives.
 * Miroir des règles du serveur (TypeOrganisation / TypeDocumentOrganisation).
 */

export type TypeOrganisation =
  | 'ENTREPRISE'
  | 'ENTREPRISE_INDIVIDUELLE'
  | 'GIE'
  | 'COOPERATIVE'
  | 'ASSOCIATION'
  | 'ONG'
  | 'ETABLISSEMENT_PUBLIC'
  | 'COLLECTIVITE_TERRITORIALE'
  | 'ORGANISATION_INTERNATIONALE';

export type TypeDocument =
  | 'RCCM'
  | 'NIF'
  | 'STATUTS'
  | 'ATTESTATION_INPS'
  | 'QUITUS_FISCAL'
  | 'RECEPISSE_ASSOCIATION'
  | 'ACCORD_CADRE_ONG'
  | 'ACTE_CREATION'
  | 'AGREMENT'
  | 'PIECE_IDENTITE_RESPONSABLE'
  | 'AUTRE';

/** Champs « numéro officiel » du formulaire. */
export type ChampLegal = 'numeroRccm' | 'nif' | 'numeroInps' | 'numeroRecepisse' | 'numeroAccordCadre' | 'referenceActe';

export interface DefinitionType {
  code: TypeOrganisation;
  libelle: string;
  description: string;
  formes: string[];
  champsObligatoires: ChampLegal[];
  champsUtiles: ChampLegal[];
  documentsObligatoires: TypeDocument[];
  documentsConseilles: TypeDocument[];
  /** Libellé propre au type pour le numéro d'immatriculation (ex. coopératives). */
  libelleImmatriculation?: string;
}

export const TYPES_ORGANISATION: DefinitionType[] = [
  {
    code: 'ENTREPRISE', libelle: 'Entreprise', description: 'Société commerciale : SA, SARL, SAS, SUARL…',
    formes: ['SARL', 'SUARL', 'SA', 'SAS', 'SNC', 'Succursale'],
    champsObligatoires: ['numeroRccm', 'nif'], champsUtiles: ['numeroInps'],
    documentsObligatoires: ['RCCM', 'NIF'], documentsConseilles: ['STATUTS', 'ATTESTATION_INPS', 'QUITUS_FISCAL', 'PIECE_IDENTITE_RESPONSABLE'],
  },
  {
    code: 'ENTREPRISE_INDIVIDUELLE', libelle: 'Entreprise individuelle', description: 'Commerçant, artisan ou entrepreneur individuel.',
    formes: ['Entreprise individuelle', 'Entreprenant'],
    champsObligatoires: ['numeroRccm', 'nif'], champsUtiles: ['numeroInps'],
    documentsObligatoires: ['RCCM', 'NIF'], documentsConseilles: ['ATTESTATION_INPS', 'PIECE_IDENTITE_RESPONSABLE'],
  },
  {
    code: 'GIE', libelle: 'GIE', description: "Groupement d'intérêt économique.",
    formes: ['GIE'],
    champsObligatoires: ['numeroRccm'], champsUtiles: ['nif'],
    documentsObligatoires: ['RCCM', 'STATUTS'], documentsConseilles: ['NIF', 'PIECE_IDENTITE_RESPONSABLE'],
  },
  {
    code: 'COOPERATIVE', libelle: 'Société coopérative', description: 'Coopérative simplifiée ou avec conseil d’administration.',
    formes: ['SCOOPS (simplifiée)', 'SCOOP-CA (avec conseil d’administration)'],
    champsObligatoires: ['numeroRccm'], champsUtiles: ['nif'],
    documentsObligatoires: ['RCCM', 'STATUTS'], documentsConseilles: ['NIF', 'PIECE_IDENTITE_RESPONSABLE'],
    libelleImmatriculation: "Numéro d'immatriculation (registre des sociétés coopératives)",
  },
  {
    code: 'ASSOCIATION', libelle: 'Association', description: 'Association déclarée, à but non lucratif.',
    formes: ['Association déclarée', 'Association reconnue d’utilité publique', 'Fédération / Union'],
    champsObligatoires: ['numeroRecepisse'], champsUtiles: ['nif'],
    documentsObligatoires: ['RECEPISSE_ASSOCIATION', 'STATUTS'], documentsConseilles: ['NIF', 'PIECE_IDENTITE_RESPONSABLE'],
  },
  {
    code: 'ONG', libelle: 'ONG', description: "Organisation non gouvernementale liée à l'État par un accord-cadre.",
    formes: ['ONG nationale', 'ONG internationale'],
    champsObligatoires: ['numeroRecepisse', 'numeroAccordCadre'], champsUtiles: ['nif'],
    documentsObligatoires: ['RECEPISSE_ASSOCIATION', 'ACCORD_CADRE_ONG', 'STATUTS'], documentsConseilles: ['NIF', 'PIECE_IDENTITE_RESPONSABLE'],
  },
  {
    code: 'ETABLISSEMENT_PUBLIC', libelle: 'Établissement ou service public', description: 'Ministère, agence, office, EPA ou EPIC.',
    formes: ['Service de l’État', 'EPA', 'EPIC', 'Société d’État'],
    champsObligatoires: ['referenceActe'], champsUtiles: ['nif'],
    documentsObligatoires: ['ACTE_CREATION'], documentsConseilles: ['PIECE_IDENTITE_RESPONSABLE'],
  },
  {
    code: 'COLLECTIVITE_TERRITORIALE', libelle: 'Collectivité territoriale', description: 'Commune, cercle ou région.',
    formes: ['Commune', 'Conseil de cercle', 'Conseil régional'],
    champsObligatoires: ['referenceActe'], champsUtiles: [],
    documentsObligatoires: ['ACTE_CREATION'], documentsConseilles: ['PIECE_IDENTITE_RESPONSABLE'],
  },
  {
    code: 'ORGANISATION_INTERNATIONALE', libelle: 'Organisation internationale', description: 'Agence, représentation ou projet de coopération.',
    formes: ['Organisation internationale', 'Projet / programme de coopération', 'Représentation diplomatique'],
    champsObligatoires: ['referenceActe'], champsUtiles: ['nif'],
    documentsObligatoires: ['AGREMENT'], documentsConseilles: ['PIECE_IDENTITE_RESPONSABLE'],
  },
];

export const CHAMPS_LEGAUX: Record<ChampLegal, { libelle: string; aide: string; exemple: string }> = {
  numeroRccm: { libelle: 'Numéro RCCM', aide: 'Registre du commerce et du crédit mobilier (tribunal de commerce, guichet unique API-Mali).', exemple: 'MA.BKO.2026.B.12345' },
  nif: { libelle: 'NIF', aide: "Numéro d'identification fiscale (Direction générale des impôts).", exemple: '084123456X' },
  numeroInps: { libelle: 'Numéro employeur INPS', aide: 'Immatriculation à l’Institut national de prévoyance sociale.', exemple: '' },
  numeroRecepisse: { libelle: 'Numéro du récépissé de déclaration', aide: 'Récépissé délivré à la déclaration de l’association ou de l’ONG.', exemple: '' },
  numeroAccordCadre: { libelle: "Numéro de l'accord-cadre", aide: 'Accord-cadre signé entre l’ONG et l’État malien.', exemple: '' },
  referenceActe: { libelle: "Référence de l'acte", aide: 'Loi, décret, arrêté ou délibération de création ; accord de siège ou agrément pour une organisation internationale.', exemple: 'Décret n° …' },
};

export const DOCUMENTS: Record<TypeDocument, { libelle: string; aide: string }> = {
  RCCM: { libelle: 'Extrait ou certificat RCCM', aide: 'Délivré par le tribunal de commerce ou le guichet unique.' },
  NIF: { libelle: 'Attestation ou carte NIF', aide: 'Délivrée par la Direction générale des impôts.' },
  STATUTS: { libelle: 'Statuts signés', aide: 'Version en vigueur, signée.' },
  ATTESTATION_INPS: { libelle: "Attestation d'immatriculation INPS", aide: 'Pour les organisations qui emploient du personnel.' },
  QUITUS_FISCAL: { libelle: 'Attestation de régularité fiscale', aide: 'Quitus fiscal récent.' },
  RECEPISSE_ASSOCIATION: { libelle: 'Récépissé de déclaration', aide: "Délivré par l'administration à la déclaration de l'association." },
  ACCORD_CADRE_ONG: { libelle: 'Accord-cadre ONG', aide: "Accord-cadre signé avec l'État." },
  ACTE_CREATION: { libelle: 'Acte de création', aide: 'Loi, décret, arrêté ou délibération.' },
  AGREMENT: { libelle: "Agrément ou accord de siège", aide: "Autorisation d'exercer au Mali." },
  PIECE_IDENTITE_RESPONSABLE: { libelle: "Pièce d'identité du responsable", aide: 'Carte NINA, carte d’identité ou passeport.' },
  AUTRE: { libelle: 'Autre document', aide: 'Tout autre justificatif utile.' },
};

export function definitionType(code: string | null | undefined): DefinitionType | undefined {
  return TYPES_ORGANISATION.find((t) => t.code === code);
}

/** Formats acceptés pour les pièces : PDF, JPG, PNG (10 Mo maximum). */
export const FORMATS_PIECES = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
export const TAILLE_MAX_PIECE = 10 * 1024 * 1024;

export function verifierFichierPiece(f: File): string | null {
  const ext = (f.name.split('.').pop() ?? '').toLowerCase();
  if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) return 'Format non accepté : PDF, JPG ou PNG.';
  if (f.size > TAILLE_MAX_PIECE) return 'Fichier trop volumineux (10 Mo maximum).';
  if (f.size === 0) return 'Le fichier est vide.';
  return null;
}
