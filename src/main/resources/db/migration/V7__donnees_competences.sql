-- Données de départ : régions du Mali et communes du District de Bamako.
-- Insertion idempotente : une ligne déjà présente (même nom) n'est pas dupliquée.
-- Les autres communes peuvent être ajoutées via l'espace d'administration (POST /api/v1/communes).

-- TABLE : secteur_activite

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Bâtiment et travaux publics", "Construction, maintenance et infrastructures." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Bâtiment et travaux publics");

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Énergie et électricité", "Installation et maintenance des systèmes électriques et énergétiques." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Énergie et électricité");

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Mécanique et automobile", "Réparation, entretien et diagnostic des véhicules et machines." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Mécanique et automobile");

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Agriculture et élevage", "Production agricole, élevage et transformation." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Agriculture et élevage");

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Numérique et télécoms", "Développement, support informatique et télécommunications." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Numérique et télécoms");

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Artisanat et métiers manuels", "Couture, menuiserie, soudure et autres métiers artisanaux." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Artisanat et métiers manuels");

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Commerce et services", "Vente, gestion, restauration et services de proximité." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Commerce et services");

INSERT INTO secteur_activite (id, nom, description)
SELECT UUID(), "Logistique et transport", "Transport, magasinage et gestion des flux." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM secteur_activite WHERE nom = "Logistique et transport");


-- TABLE : metier

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Bâtiment et travaux publics"), "Maçon", "Construction et rénovation de bâtiments." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Maçon");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Bâtiment et travaux publics"), "Carreleur", "Pose de revêtements de sols et murs." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Carreleur");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Bâtiment et travaux publics"), "Plombier", "Installation et maintenance des réseaux d'eau." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Plombier");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Énergie et électricité"), "Électricien bâtiment", "Installation électrique des bâtiments." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Électricien bâtiment");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Énergie et électricité"), "Installateur solaire", "Installation et maintenance de systèmes solaires." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Installateur solaire");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Énergie et électricité"), "Technicien maintenance électrique", "Maintenance des équipements électriques." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Technicien maintenance électrique");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Mécanique et automobile"), "Mécanicien automobile", "Entretien et réparation automobile." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Mécanicien automobile");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Mécanique et automobile"), "Électricien automobile", "Diagnostic et réparation des circuits électriques automobiles." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Électricien automobile");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Mécanique et automobile"), "Soudeur industriel", "Assemblage et réparation par soudage." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Soudeur industriel");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Agriculture et élevage"), "Agriculteur", "Production agricole." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Agriculteur");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Agriculture et élevage"), "Éleveur", "Conduite d'élevage et soins aux animaux." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Éleveur");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Agriculture et élevage"), "Transformateur agroalimentaire", "Transformation et conservation des produits agricoles." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Transformateur agroalimentaire");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Numérique et télécoms"), "Développeur web", "Conception et développement d'applications web." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Développeur web");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Numérique et télécoms"), "Technicien support informatique", "Installation, dépannage et assistance informatique." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Technicien support informatique");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Numérique et télécoms"), "Technicien télécom", "Installation et maintenance de réseaux télécoms." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Technicien télécom");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Artisanat et métiers manuels"), "Couturier", "Confection et retouche de vêtements." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Couturier");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Artisanat et métiers manuels"), "Menuisier", "Fabrication et pose d'ouvrages en bois." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Menuisier");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Artisanat et métiers manuels"), "Forgeron", "Fabrication et réparation d'objets métalliques." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Forgeron");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Commerce et services"), "Vendeur", "Accueil, conseil et vente." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Vendeur");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Commerce et services"), "Gestionnaire de stock", "Réception, rangement et suivi des stocks." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Gestionnaire de stock");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Commerce et services"), "Cuisinier", "Préparation et organisation de repas." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Cuisinier");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Logistique et transport"), "Chauffeur", "Transport de personnes ou de marchandises." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Chauffeur");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Logistique et transport"), "Magasinier", "Réception, rangement et préparation des marchandises." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Magasinier");

INSERT INTO metier (id, secteur_activite_id, nom, description)
SELECT UUID(), (SELECT id FROM secteur_activite WHERE nom = "Logistique et transport"), "Agent logistique", "Organisation et suivi des opérations logistiques." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM metier WHERE nom = "Agent logistique");


-- TABLE : competence

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Maçon"), "Lecture de plans simples", "Compétence de démonstration : Lecture de plans simples." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Lecture de plans simples");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Maçon"), "Préparation du béton", "Compétence de démonstration : Préparation du béton." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Préparation du béton");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Maçon"), "Montage de murs", "Compétence de démonstration : Montage de murs." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Montage de murs");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Carreleur"), "Préparation des surfaces", "Compétence de démonstration : Préparation des surfaces." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Préparation des surfaces");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Carreleur"), "Pose de carrelage", "Compétence de démonstration : Pose de carrelage." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Pose de carrelage");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Carreleur"), "Finition des joints", "Compétence de démonstration : Finition des joints." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Finition des joints");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Plombier"), "Installation de canalisations", "Compétence de démonstration : Installation de canalisations." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Installation de canalisations");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Plombier"), "Détection de fuites", "Compétence de démonstration : Détection de fuites." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Détection de fuites");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Plombier"), "Pose d'équipements sanitaires", "Compétence de démonstration : Pose d'équipements sanitaires." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Pose d'équipements sanitaires");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Électricien bâtiment"), "Lecture de schémas électriques", "Compétence de démonstration : Lecture de schémas électriques." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Lecture de schémas électriques");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Électricien bâtiment"), "Câblage domestique", "Compétence de démonstration : Câblage domestique." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Câblage domestique");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Électricien bâtiment"), "Mise en sécurité d'une installation", "Compétence de démonstration : Mise en sécurité d'une installation." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Mise en sécurité d'une installation");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Installateur solaire"), "Dimensionnement solaire de base", "Compétence de démonstration : Dimensionnement solaire de base." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Dimensionnement solaire de base");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Installateur solaire"), "Pose de panneaux photovoltaïques", "Compétence de démonstration : Pose de panneaux photovoltaïques." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Pose de panneaux photovoltaïques");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Installateur solaire"), "Maintenance d'une installation solaire", "Compétence de démonstration : Maintenance d'une installation solaire." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Maintenance d'une installation solaire");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien maintenance électrique"), "Diagnostic électrique", "Compétence de démonstration : Diagnostic électrique." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Diagnostic électrique");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien maintenance électrique"), "Maintenance préventive", "Compétence de démonstration : Maintenance préventive." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Maintenance préventive");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien maintenance électrique"), "Utilisation d'un multimètre", "Compétence de démonstration : Utilisation d'un multimètre." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Utilisation d'un multimètre");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Mécanicien automobile"), "Entretien moteur", "Compétence de démonstration : Entretien moteur." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Entretien moteur");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Mécanicien automobile"), "Diagnostic de panne", "Compétence de démonstration : Diagnostic de panne." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Diagnostic de panne");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Mécanicien automobile"), "Remplacement de pièces", "Compétence de démonstration : Remplacement de pièces." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Remplacement de pièces");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Électricien automobile"), "Diagnostic circuit électrique", "Compétence de démonstration : Diagnostic circuit électrique." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Diagnostic circuit électrique");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Électricien automobile"), "Utilisation d'un outil de diagnostic", "Compétence de démonstration : Utilisation d'un outil de diagnostic." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Utilisation d'un outil de diagnostic");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Électricien automobile"), "Réparation faisceau électrique", "Compétence de démonstration : Réparation faisceau électrique." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Réparation faisceau électrique");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Soudeur industriel"), "Préparation des pièces", "Compétence de démonstration : Préparation des pièces." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Préparation des pièces");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Soudeur industriel"), "Soudage à l'arc", "Compétence de démonstration : Soudage à l'arc." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Soudage à l'arc");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Soudeur industriel"), "Contrôle visuel des soudures", "Compétence de démonstration : Contrôle visuel des soudures." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Contrôle visuel des soudures");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Agriculteur"), "Préparation des sols", "Compétence de démonstration : Préparation des sols." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Préparation des sols");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Agriculteur"), "Irrigation", "Compétence de démonstration : Irrigation." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Irrigation");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Agriculteur"), "Gestion d'une parcelle", "Compétence de démonstration : Gestion d'une parcelle." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Gestion d'une parcelle");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Éleveur"), "Alimentation du bétail", "Compétence de démonstration : Alimentation du bétail." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Alimentation du bétail");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Éleveur"), "Soins de base aux animaux", "Compétence de démonstration : Soins de base aux animaux." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Soins de base aux animaux");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Éleveur"), "Suivi d'un troupeau", "Compétence de démonstration : Suivi d'un troupeau." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Suivi d'un troupeau");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Transformateur agroalimentaire"), "Hygiène alimentaire", "Compétence de démonstration : Hygiène alimentaire." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Hygiène alimentaire");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Transformateur agroalimentaire"), "Transformation des céréales", "Compétence de démonstration : Transformation des céréales." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Transformation des céréales");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Transformateur agroalimentaire"), "Conditionnement des produits", "Compétence de démonstration : Conditionnement des produits." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Conditionnement des produits");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Développeur web"), "HTML et CSS", "Compétence de démonstration : HTML et CSS." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "HTML et CSS");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Développeur web"), "Développement JavaScript", "Compétence de démonstration : Développement JavaScript." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Développement JavaScript");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Développeur web"), "Conception d'API REST", "Compétence de démonstration : Conception d'API REST." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Conception d'API REST");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien support informatique"), "Installation de postes", "Compétence de démonstration : Installation de postes." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Installation de postes");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien support informatique"), "Diagnostic logiciel", "Compétence de démonstration : Diagnostic logiciel." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Diagnostic logiciel");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien support informatique"), "Assistance aux utilisateurs", "Compétence de démonstration : Assistance aux utilisateurs." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Assistance aux utilisateurs");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien télécom"), "Tirage de câbles réseau", "Compétence de démonstration : Tirage de câbles réseau." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Tirage de câbles réseau");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien télécom"), "Configuration réseau de base", "Compétence de démonstration : Configuration réseau de base." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Configuration réseau de base");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Technicien télécom"), "Maintenance d'équipements télécom", "Compétence de démonstration : Maintenance d'équipements télécom." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Maintenance d'équipements télécom");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Couturier"), "Prise de mesures", "Compétence de démonstration : Prise de mesures." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Prise de mesures");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Couturier"), "Confection de vêtements", "Compétence de démonstration : Confection de vêtements." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Confection de vêtements");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Couturier"), "Retouche et finition", "Compétence de démonstration : Retouche et finition." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Retouche et finition");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Menuisier"), "Lecture de mesures", "Compétence de démonstration : Lecture de mesures." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Lecture de mesures");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Menuisier"), "Assemblage bois", "Compétence de démonstration : Assemblage bois." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Assemblage bois");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Menuisier"), "Finition et vernissage", "Compétence de démonstration : Finition et vernissage." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Finition et vernissage");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Forgeron"), "Découpe du métal", "Compétence de démonstration : Découpe du métal." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Découpe du métal");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Forgeron"), "Forgeage", "Compétence de démonstration : Forgeage." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Forgeage");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Forgeron"), "Finition des pièces métalliques", "Compétence de démonstration : Finition des pièces métalliques." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Finition des pièces métalliques");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Vendeur"), "Accueil client", "Compétence de démonstration : Accueil client." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Accueil client");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Vendeur"), "Techniques de vente", "Compétence de démonstration : Techniques de vente." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Techniques de vente");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Vendeur"), "Gestion de caisse", "Compétence de démonstration : Gestion de caisse." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Gestion de caisse");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Gestionnaire de stock"), "Réception de marchandises", "Compétence de démonstration : Réception de marchandises." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Réception de marchandises");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Gestionnaire de stock"), "Inventaire", "Compétence de démonstration : Inventaire." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Inventaire");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Gestionnaire de stock"), "Suivi des mouvements de stock", "Compétence de démonstration : Suivi des mouvements de stock." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Suivi des mouvements de stock");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Cuisinier"), "Préparation des ingrédients", "Compétence de démonstration : Préparation des ingrédients." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Préparation des ingrédients");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Cuisinier"), "Cuisson", "Compétence de démonstration : Cuisson." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Cuisson");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Cuisinier"), "Hygiène en cuisine", "Compétence de démonstration : Hygiène en cuisine." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Hygiène en cuisine");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Chauffeur"), "Conduite préventive", "Compétence de démonstration : Conduite préventive." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Conduite préventive");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Chauffeur"), "Entretien courant du véhicule", "Compétence de démonstration : Entretien courant du véhicule." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Entretien courant du véhicule");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Chauffeur"), "Transport sécurisé", "Compétence de démonstration : Transport sécurisé." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Transport sécurisé");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Magasinier"), "Préparation de commandes", "Compétence de démonstration : Préparation de commandes." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Préparation de commandes");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Magasinier"), "Rangement des marchandises", "Compétence de démonstration : Rangement des marchandises." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Rangement des marchandises");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Magasinier"), "Utilisation d'un registre de stock", "Compétence de démonstration : Utilisation d'un registre de stock." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Utilisation d'un registre de stock");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Agent logistique"), "Planification des flux", "Compétence de démonstration : Planification des flux." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Planification des flux");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Agent logistique"), "Suivi des livraisons", "Compétence de démonstration : Suivi des livraisons." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Suivi des livraisons");

INSERT INTO competence (id, metier_id, nom, description)
SELECT UUID(), (SELECT id FROM metier WHERE nom = "Agent logistique"), "Coordination transport", "Compétence de démonstration : Coordination transport." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM competence WHERE nom = "Coordination transport");