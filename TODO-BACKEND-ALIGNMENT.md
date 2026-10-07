# MaliCompétences Web — TODO d'intégration backend

## Règle de périmètre

Le Web professionnel de départ est réservé à :
- Organisation
- Admin
- SuperAdmin

Le Citoyen et l'Évaluateur ne sont pas exposés dans ce Web de départ. Le parcours citoyen reste mobile ; le rôle d'évaluation sera intégré avec le workflow dédié lorsqu'il sera stabilisé.

Les rôles Gestionnaire/Centre et Institution/Observateur sont préparés dans l'interface mais ne sont pas ajoutés au JWT tant que le backend ne les expose pas.

## Raccordé dans les routes utilisées par l'interface professionnelle

- Organisation : consultation du profil courant, modification et indicateurs agrégés.
- Besoins : liste par organisation, lecture, création, modification des compétences associées et suppression avec contrôle de propriété.
- Talents : recherche anonymisée par compétence, métier, lieu et disponibilité ; détail et matching par besoin.
- Suivis et mises en relation : API de liste/création/mise à jour contextualisée, avec vérification d'accès.
- Notifications : liste triée par date, marquage comme lue et vérification du destinataire.
- Administration : tableaux de synthèse, citoyens, organisations, validations, tests numériques, opportunités, centres et compétences.
- Super-administration : liste des comptes sans données d'authentification et modification du rôle.
- Opportunités : lecture publique, API de gestion protégée, publication et archivage.
- Skills-Gap : lecture des indicateurs et filtres territoriaux.

## Encore à compléter avant de déclarer tout le cahier des charges livré

- Gestion complète (création/modification/suppression) du référentiel secteurs/métiers/compétences et interface CRUD dédiée.
- Formulaires d'administration complets pour les tests/questions/propositions, les opportunités et les centres (les API disponibles ne remplacent pas ces interfaces CRUD).
- Journal d'audit persistant des consultations, actions et événements importants : aucun modèle/service d'audit exploitable n'existait; les journaux ne sont pas simulés.
- Paramètres globaux persistants de la plateforme : aucun modèle ni stockage de paramètres n'existait.
- Workflow de réponse par le destinataire d'une demande de mise en relation et synchronisation de son statut avec le suivi.
- Vue Institution / Observateur : rôles et endpoints dédiés absents du backend.
- Les suites backend doivent être exécutées avec un JDK correspondant à la version configurée dans le projet.

Les erreurs d'API sont exposées dans l'interface; aucune donnée de secours n'est présentée comme une réponse backend.
