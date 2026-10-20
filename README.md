# MaliCompétences — Portail web professionnel

Frontend Angular 22, Tailwind CSS 4, DaisyUI 5 et Leaflet.

## Espaces disponibles

- **Organisation** : profil avec numéro RCCM, besoins, recherche et suivi des talents, demandes de mise en relation.
- **Administration** : validations, organisations, centres, territoires, référentiel, tests numériques et suivi opérationnel.
- **Super administration** : gestion des comptes, affectation des gestionnaires de centre et publication des opportunités.
- **Gestionnaire de centre** : informations du centre, désignation des évaluateurs et activation/suspension de leurs accès.
- **Institution** : tableaux de bord, carte territoriale et indicateurs agrégés soumis aux règles de confidentialité.

Les citoyens et les évaluateurs conservent leurs parcours principaux sur mobile. Le gestionnaire de centre dispose d’un espace web distinct, sans rôle d’évaluateur ajouté aux comptes.

## Identité visuelle

Le portail conserve la palette MaliCompétences (vert profond, or discret et fond ivoire), avec Cabin pour l’interface et GFS Artemisia pour les titres. Les pages utilisent des composants partagés, une hiérarchie sobre et des confirmations en modal pour les actions sensibles.

## API

Le portail consomme les routes Spring Boot `/api` et `/api/v1` selon les contrôleurs existants. Le numéro RCCM est facultatif à l’inscription et modifiable depuis le profil organisation ; il est également visible par les administrateurs lors de l’examen d’un dossier. L’affectation d’un gestionnaire se fait depuis la fiche d’un centre et non via un changement manuel de rôle.

## Démarrage

```bash
npm install
npm start
```

Pour le développement local, exposer Spring Boot sur `http://localhost:8080` et adapter le proxy Angular si nécessaire. La carte utilise `public/geo/mali-regions.geojson` ; consulter `public/geo/README.md` pour les codes et précautions de licence.
