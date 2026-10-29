# MaliCompétences Web — structure à respecter

Ce dossier `design-final/` est **la version fusionnée des étapes 1 à 5** (en cas de fichier présent dans plusieurs étapes, la plus récente l'emporte). Les dossiers `design-step1…5` ne servent plus qu'à l'historique : ne copie que celui-ci.

## 1. Application (une seule fois)

1. Copie `design-final/src/` par-dessus ton `src/` (les chemins sont identiques).
2. `npm i @fontsource-variable/bricolage-grotesque` puis `npm rm daisyui`.
3. Dans `src/index.html`, tu peux retirer `data-theme="light"` (sans effet désormais). `main.ts` peut garder son observateur : la classe `mc-observe` n'a plus d'effet.
4. `@angular/cdk` n'est **pas** requis : je l'ai retiré du CSS.
5. `ng serve`, puis vérifie : connexion, tableau de bord, une carte, une page avec modale.

## 2. Arborescence finale (N = nouveau, R = remplace l'existant)

```
src/
├── styles.css                    R  jetons (couleurs, polices, rayons, ombres), base, menu, états de compétence
├── composants.css                N  boutons, champs, cartes, tableaux, badges, alertes, modales… + barre tricolore + motifs bogolan
├── graphiques.css                N  anneaux, histogrammes, classements, bulles, info-bulles, contrôles Leaflet
└── app/
    ├── core/
    │   ├── auth/
    │   │   └── password-recovery.service.ts     N  forgot-password / reset-password
    │   └── geo/
    │       ├── mali-palette.ts           N  UNIQUE source des couleurs de carte
    │       └── mali-base-map.ts          R  fond de carte, repère en losange, pastille de localité
    ├── layout/
    │   ├── shell/        shell.component.{ts,html}      R  sans drawer DaisyUI (signal)
    │   ├── sidebar/      sidebar.component.{ts,html}    R  barre tricolore, repère d'emplacement, ruban bogolan
    │   └── header/       header.component.{ts,html}     R  texte, sans icônes
    ├── shared/
    │   ├── libelle.pipe.ts                              R  + VERIFIEE, DECLAREE, NON_VERIFIEE, A_REVALIDER
    │   └── components/
    │       ├── status-badge.component.{ts,html}         R  familles d'état, losange
    │       ├── page-header.component.{ts,html}          R
    │       ├── empty-state.component.{ts,html}          R  ruban bogolan
    │       ├── loading.component.html                   R  losange qui tourne
    │       ├── auth-layout.component.{ts,html}          N  cadre d'authentification : bande de bogolan tissée
    │       ├── stepper.component.{ts,html}              N  mc-stepper : étapes en losanges
    │       ├── field.component.{ts,html}                N  mc-field : libellé, aide, erreur
    │       ├── stat-card.component.{ts,html}            N  mc-stat-card : chiffre clé, valeur masquée en pointillés
    │       └── charts.component.ts                      R  palette MC_CHART recolorée (noms inchangés)
    └── features/
        ├── auth/         login, register, verification (.ts/.html)   R  cadre ; register utilise mc-stepper ; logique inchangée
        │                 forgot-password, reset-password (.ts/.html)  N  CA7
        │                 auth.routes.ts                               R  + 2 routes
        ├── dashboard/    dashboard.component.{ts,html}               R  migré : mc-stat-card, carte en 2e position, sélecteur d'indicateur
        │                 mali-map.component.{ts,html}                R  carte pièce maîtresse, pointillés = sans donnée, emplacement [commandes]
        ├── carte/        carte-mali-talents.component.{ts,html}      R  losanges, palette bleue
        └── organisation/ carte-talents.component.{ts,html}           R  losanges, légende
```

À ne **pas** copier : le dossier `besoins-slice/` livré plus tôt. Il supposait un projet sans couche données ; ton web est déjà aligné sur l'API, donc il fait doublon (garde seulement `MIGRATION_besoins.md` comme mémo des écarts d'API).

## 3. Règles de ce système

**Où vit quoi**
- Un jeton (couleur, police, rayon, ombre) se définit dans `styles.css`, bloc `@theme`. Jamais ailleurs.
- Une classe de composant réutilisable se définit dans `composants.css` (ou `graphiques.css` pour graphiques et cartes).
- Aucune couleur en hexadécimal dans les `.ts` et `.html`, sauf dans `core/geo/mali-palette.ts` et `MC_CHART` (charts.component.ts).
- Un nouveau composant partagé : dossier `shared/components/`, sélecteur `mc-…`, standalone, `input()` / `output()`, gabarit dans son propre `.html`, classes Tailwind uniquement.

**Aspect**
- Rayons : `rounded-control` (8 px) pour boutons, champs, badges ; `rounded-panel` (12 px) pour les panneaux. Pas de `rounded-full`, `rounded-xl`, `rounded-2xl` dans le nouveau code.
- Pas d'ombre sauf sur ce qui flotte (`shadow-theme-md` ou `-lg`). Les panneaux se séparent par une bordure.
- Casse normale pour tous les libellés : pas de MAJUSCULES espacées.
- Titres, grands chiffres : police `font-display`. Nombres dans les tableaux : `tabular-nums`.
- **Aucune icône standard.** L'unique forme graphique est le losange (état, alerte, chargement, case cochée, marqueur de carte). Un état se montre avec `mc-status-badge`, jamais avec une couleur seule.
- Pointillés = « pas de preuve, pas de donnée » (compétence déclarée, territoire sans donnée, brouillon). Trait plein = vérifié ou présent.
- Ocre = « à surveiller / à revalider » uniquement. Vert = « vérifiée ». Pas d'autre usage.

**Signature (rare par choix)**
- Barre vert-jaune-rouge : trois emplacements seulement : marque dans la sidebar, panneau d'authentification, en-tête de la carte. N'en ajoute pas ailleurs.
- Motif bogolan : ruban en pied de sidebar, tête des écrans vides, bande tissée du panneau d'authentification. Même règle. Les bandes (`motif-bogolan-chevrons`, `-losanges`, `-dents`, `-croix`, `-points`) ne servent qu'à ce panneau.
- Animation `revelation` : réservée à ce panneau (arrivée sur la page). Ne pas la réutiliser ailleurs.

**Mouvement**
- Autorisé seulement s'il répond à un geste (ouvrir un menu, une fenêtre, appuyer sur un bouton) : animation `ouverture`. Tout est coupé par `prefers-reduced-motion` et `html[data-eco="true"]`.
- Pour la préférence « économie de données » (CA14), le service de préférences doit poser `data-eco="true"` sur `<html>` : **à brancher** (pas encore fait).

**Code**
- Aucune logique métier dans les composants visuels ; les services et l'API ne sont pas touchés par ce chantier.
- Les classes `btn`, `mc-input`, `mc-card`, `alert`, `badge`, `table`, `modal`, `dropdown` des pages existantes restent valides (couche de compatibilité). Pour une page nouvelle ou migrée, préfère les mêmes classes : elles sont désormais la référence.
- Les alias `mc-green-*` / `mc-gold-800` sont temporaires (7 occurrences) : à supprimer en migrant ces écrans.

## 4. À venir (emplacements fixés)

```
src/app/shared/components/
src/app/core/ui/
    confirmation-dialog.component.*      R  repris dans le nouveau style de modale
src/app/features/public/
    home-page.component.ts               R  site public (barre, motifs, chiffres)
src/app/features/<feature>/              R  migration page par page : dashboard, besoins, organisation, profil, admin…
```

Adopter `mc-field` et `mc-stat-card` au fil de la migration (les anciens `mc-label` + `mc-input` et `mc-stat-card` en CSS continuent de fonctionner).

Ordre conseillé de migration : ~~dashboard~~ (fait) → besoins → organisation → profil → admin, car ce sont les écrans les plus utilisés.
