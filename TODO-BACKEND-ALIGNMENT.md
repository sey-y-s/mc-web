# MaliCompétences Web — TODO d'intégration backend

## Règle de périmètre

Le Web professionnel de départ est réservé à :
- Organisation
- Admin
- SuperAdmin

Le Citoyen et l'Évaluateur ne sont pas exposés dans ce Web de départ. Le parcours citoyen reste mobile ; le rôle d'évaluation sera intégré avec le workflow dédié lorsqu'il sera stabilisé.

Les rôles Gestionnaire/Centre et Institution/Observateur sont préparés dans l'interface mais ne sont pas ajoutés au JWT tant que le backend ne les expose pas.

## Déjà réellement raccordé aux routes backend livrées

- authentification JWT
- référentiel des compétences (lecture)
- compétences citoyen (API disponible, UI professionnelle à compléter selon les usages admin)
- expériences
- portfolio et médias
- preuves
- validations par compétence
- tests numériques et résultats

## Endpoints backend à compléter avant activation des écrans concernés

- Organisation : CRUD + statut
- Besoin : CRUD + BesoinCompetence
- Recherche de talents : recherche anonymisée + filtres
- Matching : score + détails de correspondance
- SuiviBesoinTalent : Kanban et actions de statut
- DemandeMiseEnRelation : création, réponse, historique
- Notifications : lecture/non-lu
- Opportunités : CRUD + publication SuperAdmin
- Dashboard agrégé
- Administration des utilisateurs
- Audit ConsultationProfil
- Centres
- Vue Institution / Observateur

## Important

Les écrans correspondants existent déjà avec des TODO explicites. Ils ne fabriquent pas de données fictives présentées comme provenant du backend.
