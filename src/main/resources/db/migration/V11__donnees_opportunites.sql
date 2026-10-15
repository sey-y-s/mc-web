-- Catégories d'opportunités
INSERT INTO categorie_opportunite (id, nom, description)
SELECT UUID(), "Formations et apprentissage", "Formations gratuites et opportunités d'apprentissage." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categorie_opportunite WHERE nom = "Formations et apprentissage");

INSERT INTO categorie_opportunite (id, nom, description)
SELECT UUID(), "Bourses", "Bourses d'études et de formation." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categorie_opportunite WHERE nom = "Bourses");

INSERT INTO categorie_opportunite (id, nom, description)
SELECT UUID(), "Programmes", "Programmes d'accompagnement et d'insertion." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categorie_opportunite WHERE nom = "Programmes");

INSERT INTO categorie_opportunite (id, nom, description)
SELECT UUID(), "Concours et appels", "Concours et appels à candidatures." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categorie_opportunite WHERE nom = "Concours et appels");

INSERT INTO categorie_opportunite (id, nom, description)
SELECT UUID(), "Accompagnement", "Dispositifs d'accompagnement professionnel." FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM categorie_opportunite WHERE nom = "Accompagnement");


-- Opportunités
INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Formations et apprentissage"),
       "Formation solaire pratique",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "PUBLIEE",
       "FORMATION_GRATUITE",
       "2026-09-15 09:00:00",
       "2026-11-15"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Formation solaire pratique");

INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Bourses"),
       "Bourse de formation numérique",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "PUBLIEE",
       "BOURSE",
       "2026-09-10 09:00:00",
       "2026-12-01"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Bourse de formation numérique");

INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Programmes"),
       "Programme d'insertion des jeunes",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "PUBLIEE",
       "INSERTION",
       "2026-09-01 09:00:00",
       "2026-11-30"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Programme d'insertion des jeunes");

INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Concours et appels"),
       "Appel à candidatures métiers",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "PUBLIEE",
       "APPEL_CANDIDATURE",
       "2026-09-20 09:00:00",
       "2026-10-30"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Appel à candidatures métiers");

INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Accompagnement"),
       "Concours artisanat local",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "BROUILLON",
       "CONCOURS",
       NULL,
       "2026-11-15"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Concours artisanat local");

INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Formations et apprentissage"),
       "Programme d'accompagnement PME",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "EXPIREE",
       "ACCOMPAGNEMENT",
       "2026-06-03 09:00:00",
       "2026-08-22"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Programme d'accompagnement PME");

INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Bourses"),
       "Programme de transformation agricole",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "ARCHIVEE",
       "PROGRAMME",
       "2026-03-05 09:00:00",
       "2026-06-03"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Programme de transformation agricole");

INSERT INTO opportunite (id, categorie_id, titre, description, statut, type, date_publication, date_expiration)
SELECT UUID(),
       (SELECT id FROM categorie_opportunite WHERE nom = "Programmes"),
       "Atelier de création d'activité",
       "Opportunité de démonstration pour tester la publication, la recherche et les filtres.",
       "PUBLIEE",
       "AUTRE",
       "2026-09-06 09:00:00",
       "2026-10-25"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM opportunite WHERE titre = "Atelier de création d'activité");


-- skills-gap

-- Indicateurs de pénurie de compétences (Skills Gap) adaptés et dynamiques

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Kayes"),
       (SELECT id FROM competence WHERE nom = "Lecture de plans simples"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "10", "6", "4"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Kayes")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Lecture de plans simples")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Kayes"),
       (SELECT id FROM competence WHERE nom = "Préparation du béton"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "12", "7", "5"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Kayes")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Préparation du béton")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Koulikoro"),
       (SELECT id FROM competence WHERE nom = "Montage de murs"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "14", "8", "6"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Koulikoro")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Montage de murs")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Sikasso"),
       (SELECT id FROM competence WHERE nom = "Préparation des surfaces"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "16", "9", "7"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Sikasso")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Préparation des surfaces")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Ségou"),
       (SELECT id FROM competence WHERE nom = "Pose de carrelage"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "18", "10", "8"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Ségou")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Pose de carrelage")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Mopti"),
       (SELECT id FROM competence WHERE nom = "Finition des joints"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "20", "11", "9"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Mopti")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Finition des joints")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Tombouctou"),
       (SELECT id FROM competence WHERE nom = "Installation de canalisations"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "22", "12", "10"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Tombouctou")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Installation de canalisations")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Gao"),
       (SELECT id FROM competence WHERE nom = "Détection de fuites"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "24", "13", "11"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Gao")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Détection de fuites")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Kidal"),
       (SELECT id FROM competence WHERE nom = "Lecture de plans simples"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "13", "8", "5"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Kidal")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Lecture de plans simples")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Taoudénit"),
       (SELECT id FROM competence WHERE nom = "Préparation du béton"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "15", "9", "6"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Taoudénit")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Préparation du béton")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Ménaka"),
       (SELECT id FROM competence WHERE nom = "Montage de murs"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "17", "10", "7"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Ménaka")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Montage de murs")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Bamako"),
       (SELECT id FROM competence WHERE nom = "Dimensionnement solaire de base"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "19", "11", "8"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Bamako")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Dimensionnement solaire de base")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Nioro"),
       (SELECT id FROM competence WHERE nom = "Pose de panneaux photovoltaïques"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "21", "12", "9"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Nioro")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Pose de panneaux photovoltaïques")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Kita"),
       (SELECT id FROM competence WHERE nom = "Maintenance d'une installation solaire"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "23", "13", "10"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Kita")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Maintenance d'une installation solaire")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Dioïla"),
       (SELECT id FROM competence WHERE nom = "HTML et CSS"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "25", "14", "11"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Dioïla")
      AND competence_id = (SELECT id FROM competence WHERE nom = "HTML et CSS")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "San"),
       (SELECT id FROM competence WHERE nom = "Développement JavaScript"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "28", "17", "11"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "San")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Développement JavaScript")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Douentza"),
       (SELECT id FROM competence WHERE nom = "Conception d'API REST"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "16", "8", "8"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Douentza")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Conception d'API REST")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Bandiagara"),
       (SELECT id FROM competence WHERE nom = "Transformation des céréales"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "19", "10", "9"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Bandiagara")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Transformation des céréales")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Ségou"),
       (SELECT id FROM competence WHERE nom = "Irrigation"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "22", "12", "10"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Ségou")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Irrigation")
      AND periode_debut = "2026-07-01"
);

INSERT INTO indicateur_skills_gap (id, region_id, competence_id, periode_debut, periode_fin, date_calcul, demande_estimee, offre_disponible, ecart)
SELECT UUID(),
       (SELECT id FROM region WHERE nom = "Nara"),
       (SELECT id FROM competence WHERE nom = "Confection de vêtements"),
       "2026-07-01", "2026-09-30", "2026-10-01 08:00:00", "25", "14", "11"
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM indicateur_skills_gap
    WHERE region_id = (SELECT id FROM region WHERE nom = "Nara")
      AND competence_id = (SELECT id FROM competence WHERE nom = "Confection de vêtements")
      AND periode_debut = "2026-07-01"
);