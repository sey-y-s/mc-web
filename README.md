# MaliCompétences — Web professionnel

Frontend Angular 22 / Tailwind CSS 4 / DaisyUI 5 / Leaflet.

## Périmètre

Le Web est réservé aux acteurs professionnels au départ : **Organisation, Admin et SuperAdmin**. Le Citoyen et l'Évaluateur ne sont pas exposés dans cette interface ; leurs parcours restent prévus pour le mobile / les futurs espaces dédiés.

Les rôles Institution/Observateur et Gestionnaire/Centre sont préparés dans la structure fonctionnelle mais ne sont pas ajoutés au JWT tant que le backend ne les expose pas.

## Design

La structure s'inspire directement de **Windster / Flowbite** : sidebar fixe, header compact, cartes sobres, tableaux, filtres et formulaires. La police Inter est utilisée comme dans l'écosystème Themesberg/Flowbite. L'identité MaliCompétences remplace toutefois les couleurs génériques par le bleu institutionnel et un accent or discret.

## Backend

Les appels réellement disponibles dans le backend livré utilisent `/api/v1`. Les fonctions dont le backend ne possède pas encore de contrôleur sont visibles comme TODO et ne sont pas simulées comme des données réelles.

## Démarrage

```bash
npm install
npm start
```

Backend attendu sur le même hôte via le proxy / API reverse-proxy. Pour un développement local classique, exposer Spring Boot sur `http://localhost:8080` et adapter le proxy Angular si nécessaire.
