-- ==========================================
-- 1. INSERTION DES TESTS NUMÉRIQUES
-- ==========================================

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Lecture de plans simples"),
       "Test pratique maçonnerie - Lecture de plans",
       "Évaluer la capacité à lire et interpréter des plans architecturaux simples sur un chantier au Mali.",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test pratique maçonnerie - Lecture de plans");

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Câblage domestique"),
       "Test d'électricité bâtiment et câblage",
       "Évaluer les compétences fondamentales de raccordement électrique domestique et respect des normes de sécurité.",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test d'électricité bâtiment et câblage");

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Pose de panneaux photovoltaïques"),
       "Test technique solaire photovoltaïque",
       "Évaluer la maîtrise de l'installation et du raccordement des kits solaires autonomes adaptés aux zones rurales.",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test technique solaire photovoltaïque");

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Développement JavaScript"),
       "Test de développement web JavaScript",
       "Évaluer les fondamentaux de la programmation en JavaScript pour les métiers du numérique.",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test de développement web JavaScript");


-- ==========================================
-- 2. INSERTION DES QUESTIONS
-- ==========================================

-- --- Test : Test pratique maçonnerie - Lecture de plans ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique maçonnerie - Lecture de plans"),
       "Quelle est l'unité de mesure standard généralement utilisée sur les plans architecturaux de construction au Mali ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quelle est l'unité de mesure standard généralement utilisée sur les plans architecturaux de construction au Mali ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique maçonnerie - Lecture de plans"),
       "Sur un plan de fondation, les lignes en pointillés représentent généralement des éléments cachés ou enterrés.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Sur un plan de fondation, les lignes en pointillés représentent généralement des éléments cachés ou enterrés.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique maçonnerie - Lecture de plans"),
       "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique maçonnerie - Lecture de plans"),
       "Expliquez brièvement comment vous procédez pour vérifier l'équerrage d'un angle de pièce sur le terrain.",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Expliquez brièvement comment vous procédez pour vérifier l'équerrage d'un angle de pièce sur le terrain.");


-- --- Test : Test d'électricité bâtiment et câblage ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'électricité bâtiment et câblage"),
       "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'électricité bâtiment et câblage"),
       "Il est permis de travailler sur une installation électrique domestique sans couper le disjoncteur principal si on porte des gants en tissu.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Il est permis de travailler sur une installation électrique domestique sans couper le disjoncteur principal si on porte des gants en tissu.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'électricité bâtiment et câblage"),
       "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'électricité bâtiment et câblage"),
       "Décrivez les étapes de vérification d'une prise de terre avant la mise sous tension.",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Décrivez les étapes de vérification d'une prise de terre avant la mise sous tension.");


-- --- Test : Test technique solaire photovoltaïque ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique solaire photovoltaïque"),
       "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique solaire photovoltaïque"),
       "L'orientation idéale des panneaux solaires photovoltaïques dans l'hémisphère nord (comme au Mali) est orientée vers le Sud.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "L'orientation idéale des panneaux solaires photovoltaïques dans l'hémisphère nord (comme au Mali) est orientée vers le Sud.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique solaire photovoltaïque"),
       "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique solaire photovoltaïque"),
       "Comment calcule-t-on les besoins énergétiques journaliers d'un ménage pour dimensionner un système solaire ?",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Comment calcule-t-on les besoins énergétiques journaliers d'un ménage pour dimensionner un système solaire ?");


-- --- Test : Test de développement web JavaScript ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test de développement web JavaScript"),
       "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test de développement web JavaScript"),
       "En JavaScript, un tableau (Array) commence systématiquement son index à l'indice 1.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "En JavaScript, un tableau (Array) commence systématiquement son index à l'indice 1.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test de développement web JavaScript"),
       "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test de développement web JavaScript"),
       "Écrivez une fonction fléchée en JavaScript qui prend deux nombres en paramètres et retourne leur somme.",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Écrivez une fonction fléchée en JavaScript qui prend deux nombres en paramètres et retourne leur somme.");


-- ==========================================
-- 3. INSERTION DES PROPOSITIONS DE RÉPONSE
-- ==========================================

-- Réponses pour la Question 1 (Maçonnerie)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle est l'unité de mesure standard généralement utilisée sur les plans architecturaux de construction au Mali ?"), "Le centimètre (ou le mètre)", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE texte = "Le centimètre (ou le mètre)");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle est l'unité de mesure standard généralement utilisée sur les plans architecturaux de construction au Mali ?"), "Le mile nautique", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE texte = "Le mile nautique");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle est l'unité de mesure standard généralement utilisée sur les plans architecturaux de construction au Mali ?"), "Le pouce impérial", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE texte = "Le pouce impérial");


-- Réponses pour la Question 2 (Maçonnerie - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Sur un plan de fondation, les lignes en pointillés représentent généralement des éléments cachés ou enterrés."), "Vrai", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Sur un plan de fondation, les lignes en pointillés représentent généralement des éléments cachés ou enterrés.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Sur un plan de fondation, les lignes en pointillés représentent généralement des éléments cachés ou enterrés."), "Faux", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Sur un plan de fondation, les lignes en pointillés représentent généralement des éléments cachés ou enterrés.") AND texte = "Faux");


-- Réponses pour la Question 3 (Maçonnerie - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)"), "La hauteur sous plafond", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)") AND texte = "La hauteur sous plafond");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)"), "L'épaisseur des planchers et des fondations", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)") AND texte = "L'épaisseur des planchers et des fondations");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)"), "La météo prévisionnelle du mois", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels éléments retrouve-t-on habituellement sur une coupe transversale de bâtiment ? (Plusieurs choix)") AND texte = "La météo prévisionnelle du mois");


-- Réponses pour la Question 1 (Électricité)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?"), "Vert et Jaune", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?") AND texte = "Vert et Jaune");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?"), "Rouge vif", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?") AND texte = "Rouge vif");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?"), "Bleu ciel", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelle couleur de fil est obligatoirement réservée au conducteur de protection (terre) dans une installation ?") AND texte = "Bleu ciel");


-- Réponses pour la Question 2 (Électricité - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Il est permis de travailler sur une installation électrique domestique sans couper le disjoncteur principal si on porte des gants en tissu."), "Vrai", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Il est permis de travailler sur une installation électrique domestique sans couper le disjoncteur principal si on porte des gants en tissu.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Il est permis de travailler sur une installation électrique domestique sans couper le disjoncteur principal si on porte des gants en tissu."), "Faux", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Il est permis de travailler sur une installation électrique domestique sans couper le disjoncteur principal si on porte des gants en tissu.") AND texte = "Faux");


-- Réponses pour la Question 3 (Électricité - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)"), "Le disjoncteur différentiel", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)") AND texte = "Le disjoncteur différentiel");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)"), "La mise à la terre des masses métalliques", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)") AND texte = "La mise à la terre des masses métalliques");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)"), "Un simple interrupteur standard", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels dispositifs assurent la protection des personnes contre les contacts indirects ? (Plusieurs choix)") AND texte = "Un simple interrupteur standard");


-- Réponses pour la Question 1 (Solaire)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?"), "La batterie (accumulateur)", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?") AND texte = "La batterie (accumulateur)");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?"), "Le onduleur uniquement", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?") AND texte = "Le onduleur uniquement");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?"), "Le disjoncteur thermique", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel composant d'une installation solaire stocke l'énergie produite pour une utilisation nocturne ?") AND texte = "Le disjoncteur thermique");


-- Réponses pour la Question 2 (Solaire - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "L'orientation idéale des panneaux solaires photovoltaïques dans l'hémisphère nord (comme au Mali) est orientée vers le Sud."), "Vrai", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "L'orientation idéale des panneaux solaires photovoltaïques dans l'hémisphère nord (comme au Mali) est orientée vers le Sud.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "L'orientation idéale des panneaux solaires photovoltaïques dans l'hémisphère nord (comme au Mali) est orientée vers le Sud."), "Faux", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "L'orientation idéale des panneaux solaires photovoltaïques dans l'hémisphère nord (comme au Mali) est orientée vers le Sud.") AND texte = "Faux");


-- Réponses pour la Question 3 (Solaire - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)"), "L'accumulation de poussière ou de sable", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)") AND texte = "L'accumulation de poussière ou de sable");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)"), "L'ombrage partiel (arbres, bâtiments)", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)") AND texte = "L'ombrage partiel (arbres, bâtiments)");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)"), "L'utilisation de câbles de couleur bleue", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels facteurs peuvent réduire significativement le rendement des panneaux solaires ? (Plusieurs choix)") AND texte = "L'utilisation de câbles de couleur bleue");


-- Réponses pour la Question 1 (JavaScript)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?"), "const", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?") AND texte = "const");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?"), "var", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?") AND texte = "var");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?"), "let", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel mot-clé permet de déclarer une variable dont la valeur ne peut pas être réassignée en JavaScript moderne ?") AND texte = "let");


-- Réponses pour la Question 2 (JavaScript - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "En JavaScript, un tableau (Array) commence systématiquement son index à l'indice 1."), "Vrai", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "En JavaScript, un tableau (Array) commence systématiquement son index à l'indice 1.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "En JavaScript, un tableau (Array) commence systématiquement son index à l'indice 1."), "Faux", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "En JavaScript, un tableau (Array) commence systématiquement son index à l'indice 1.") AND texte = "Faux");


-- Réponses pour la Question 3 (JavaScript - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)"), "String (Chaîne de caractères)", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)") AND texte = "String (Chaîne de caractères)");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)"), "Boolean (Booléen)", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)") AND texte = "Boolean (Booléen)");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)"), "Database (Base de données native)", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels sont les types de données primitifs en JavaScript ? (Plusieurs choix)") AND texte = "Database (Base de données native)");












-- ==========================================
-- 1. INSERTION DES TESTS NUMÉRIQUES (4 nouvelles compétences)
-- ==========================================

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Transformation des céréales"),
       "Test d'évaluation - Transformation agroalimentaire et céréalière",
       "Évaluer les bonnes pratiques d'hygiène et les techniques de transformation locale des céréales (mil, sorgho, maïs).",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière");

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Irrigation"),
       "Test technique - Gestion et maîtrise de l'irrigation",
       "Évaluer la compréhension des systèmes d'irrigation agricole et de la gestion optimisée de l'eau.",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test technique - Gestion et maîtrise de l'irrigation");

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Confection de vêtements"),
       "Test pratique - Couture et confection de vêtements",
       "Évaluer la maîtrise de la coupe, de l'assemblage et des finitions en couture traditionnelle et moderne.",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test pratique - Couture et confection de vêtements");

INSERT INTO test_numerique (id, competence_id, titre, description, actif)
SELECT UUID(),
       (SELECT id FROM competence WHERE nom = "Maintenance préventive"),
       "Test technique - Maintenance préventive des équipements",
       "Évaluer les connaissances sur le suivi régulier et l'entretien préventif pour éviter les pannes industrielles.",
       TRUE
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM test_numerique WHERE titre = "Test technique - Maintenance préventive des équipements");


-- ==========================================
-- 2. INSERTION DES QUESTIONS POUR CHAQUE TEST
-- ==========================================

-- --- Test : Transformation agroalimentaire et céréalière ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Quelle étape est primordiale avant de procéder à la mouture ou au décorticage des céréales ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quelle étape est primordiale avant de procéder à la mouture ou au décorticage des céréales ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Le respect de la chaîne d'hygiène et le port d'équipements de protection (charlotte, gants) sont facultatifs dans un atelier de transformation.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Le respect de la chaîne d'hygiène et le port d'équipements de protection (charlotte, gants) sont facultatifs dans un atelier de transformation.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Quels critères garantissent un bon conditionnement des produits céréaliers transformés ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quels critères garantissent un bon conditionnement des produits céréaliers transformés ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Expliquez brièvement l'importance du séchage correct des grains avant leur stockage.",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Expliquez brièvement l'importance du séchage correct des grains avant leur stockage.");


-- --- Test : Gestion et maîtrise de l'irrigation ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Quelle méthode d'irrigation permet généralement d'économiser le plus d'eau en zone sahélienne ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quelle méthode d'irrigation permet généralement d'économiser le plus d'eau en zone sahélienne ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Un arrosage intensif en pleine journée sous un soleil de plomb est recommandé pour stimuler la croissance des plantes.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Un arrosage intensif en pleine journée sous un soleil de plomb est recommandé pour stimuler la croissance des plantes.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Quels éléments composent un kit d'irrigation goutte-à-goutte de base ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quels éléments composent un kit d'irrigation goutte-à-goutte de base ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test d'évaluation - Transformation agroalimentaire et céréalière"),
       "Comment détecte-t-on une obstruction ou un dysfonctionnement dans un réseau de tuyaux d'irrigation ?",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Comment détecte-t-on une obstruction ou un dysfonctionnement dans un réseau de tuyaux d'irrigation ?");


-- --- Test : Couture et confection de vêtements ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique - Couture et confection de vêtements"),
       "Quel outil est indispensable pour prendre correctement les mesures d'un client avant la coupe du tissu ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quel outil est indispensable pour prendre correctement les mesures d'un client avant la coupe du tissu ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique - Couture et confection de vêtements"),
       "Il est conseillé de couper directement le tissu sans repasser ou vérifier le droit-fil au préalable.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Il est conseillé de couper directement le tissu sans repasser ou vérifier le droit-fil au préalable.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique - Couture et confection de vêtements"),
       "Quelles étapes constituent les finitions soignées d'un vêtement ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quelles étapes constituent les finitions soignées d'un vêtement ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test pratique - Couture et confection de vêtements"),
       "Décrivez la méthode pour poser proprement un biais ou effectuer une surjeteuse sur une couture fragile.",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Décrivez la méthode pour poser proprement un biais ou effectuer une surjeteuse sur une couture fragile.");


-- --- Test : Maintenance préventive des équipements ---
INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique - Maintenance préventive des équipements"),
       "Quel est l'objectif principal de la maintenance préventive par rapport à la maintenance curative ?",
       "CHOIX_UNIQUE", "1"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quel est l'objectif principal de la maintenance préventive par rapport à la maintenance curative ?");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique - Maintenance préventive des équipements"),
       "La lubrification régulière des pièces mobiles en friction permet de réduire l'usure prématurée des machines.",
       "VRAI_FAUX", "2"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "La lubrification régulière des pièces mobiles en friction permet de réduire l'usure prématurée des machines.");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique - Maintenance préventive des équipements"),
       "Quelles actions inclut généralement un plan de maintenance préventive ? (Plusieurs choix)",
       "CHOIX_MULTIPLE", "3"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Quelles actions inclut généralement un plan de maintenance préventive ? (Plusieurs choix)");

INSERT INTO question (id, test_id, texte, type, ordre)
SELECT UUID(),
       (SELECT id FROM test_numerique WHERE titre = "Test technique - Maintenance préventive des équipements"),
       "Expliquez comment tenir à jour un carnet de suivi ou un registre de maintenance pour un équipement atelier.",
       "TEXTE_LIBRE", "4"
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM question WHERE texte = "Expliquez comment tenir à jour un carnet de suivi ou un registre de maintenance pour un équipement atelier.");


-- ==========================================
-- 3. INSERTION DES PROPOSITIONS DE RÉPONSE
-- ==========================================

-- Réponses - Q1 (Transformation céréales)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle étape est primordiale avant de procéder à la mouture ou au décorticage des céréales ?"), "Le nettoyage et le tri pour éliminer les impuretés et cailloux", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE texte = "Le nettoyage et le tri pour éliminer les impuretés et cailloux");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle étape est primordiale avant de procéder à la mouture ou au décorticage des céréales ?"), "L'ajout direct de colorants chimiques", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE texte = "L'ajout direct de colorants chimiques");


-- Réponses - Q2 (Transformation céréales - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Le respect de la chaîne d'hygiène et le port d'équipements de protection (charlotte, gants) sont facultatifs dans un atelier de transformation."), "Vrai", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Le respect de la chaîne d'hygiène et le port d'équipements de protection (charlotte, gants) sont facultatifs dans un atelier de transformation.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Le respect de la chaîne d'hygiène et le port d'équipements de protection (charlotte, gants) sont facultatifs dans un atelier de transformation."), "Faux", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Le respect de la chaîne d'hygiène et le port d'équipements de protection (charlotte, gants) sont facultatifs dans un atelier de transformation.") AND texte = "Faux");


-- Réponses - Q3 (Transformation céréales - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels critères garantissent un bon conditionnement des produits céréaliers transformés ? (Plusieurs choix)"), "L'étanchéité des emballages contre l'humidité", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels critères garantissent un bon conditionnement des produits céréaliers transformés ? (Plusieurs choix)") AND texte = "L'étanchéité des emballages contre l'humidité");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels critères garantissent un bon conditionnement des produits céréaliers transformés ? (Plusieurs choix)"), "L'étiquetage clair (date de fabrication, DLC, poids)", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels critères garantissent un bon conditionnement des produits céréaliers transformés ? (Plusieurs choix)") AND texte = "L'étiquetage clair (date de fabrication, DLC, poids)");


-- Réponses - Q1 (Irrigation)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle méthode d'irrigation permet généralement d'économiser le plus d'eau en zone sahélienne ?"), "Le système de goutte-à-goutte", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelle méthode d'irrigation permet généralement d'économiser le plus d'eau en zone sahélienne ?") AND texte = "Le système de goutte-à-goutte");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelle méthode d'irrigation permet généralement d'économiser le plus d'eau en zone sahélienne ?"), "L'inondation totale permanente par canaux ouverts", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelle méthode d'irrigation permet généralement d'économiser le plus d'eau en zone sahélienne ?") AND texte = "L'inondation totale permanente par canaux ouverts");


-- Réponses - Q2 (Irrigation - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Un arrosage intensif en pleine journée sous un soleil de plomb est recommandé pour stimuler la croissance des plantes."), "Vrai", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Un arrosage intensif en pleine journée sous un soleil de plomb est recommandé pour stimuler la croissance des plantes.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Un arrosage intensif en pleine journée sous un soleil de plomb est recommandé pour stimuler la croissance des plantes."), "Faux", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Un arrosage intensif en pleine journée sous un soleil de plomb est recommandé pour stimuler la croissance des plantes.") AND texte = "Faux");


-- Réponses - Q3 (Irrigation - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels éléments composent un kit d'irrigation goutte-à-goutte de base ? (Plusieurs choix)"), "Un filtre à eau pour éviter le bouchage des goutteurs", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels éléments composent un kit d'irrigation goutte-à-goutte de base ? (Plusieurs choix)") AND texte = "Un filtre à eau pour éviter le bouchage des goutteurs");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quels éléments composent un kit d'irrigation goutte-à-goutte de base ? (Plusieurs choix)"), "Des rampes ou des lignes de goutteurs percés", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quels éléments composent un kit d'irrigation goutte-à-goutte de base ? (Plusieurs choix)") AND texte = "Des rampes ou des lignes de goutteurs percés");


-- Réponses - Q1 (Couture)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel outil est indispensable pour prendre correctement les mesures d'un client avant la coupe du tissu ?"), "Le ruban métrique souple (mètre de couturière)", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel outil est indispensable pour prendre correctement les mesures d'un client avant la coupe du tissu ?") AND texte = "Le ruban métrique souple (mètre de couturière)");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel outil est indispensable pour prendre correctement les mesures d'un client avant la coupe du tissu ?"), "Un pied à coulisse métallique", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel outil est indispensable pour prendre correctement les mesures d'un client avant la coupe du tissu ?") AND texte = "Un pied à coulisse métallique");


-- Réponses - Q2 (Couture - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Il est conseillé de couper directement le tissu sans repasser ou vérifier le droit-fil au préalable."), "Vrai", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Il est conseillé de couper directement le tissu sans repasser ou vérifier le droit-fil au préalable.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Il est conseillé de couper directement le tissu sans repasser ou vérifier le droit-fil au préalable."), "Faux", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Il est conseillé de couper directement le tissu sans repasser ou vérifier le droit-fil au préalable.") AND texte = "Faux");


-- Réponses - Q3 (Couture - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelles étapes constituent les finitions soignées d'un vêtement ? (Plusieurs choix)"), "La coupe des fils excédentaires et le repassage final", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelles étapes constituent les finitions soignées d'un vêtement ? (Plusieurs choix)") AND texte = "La coupe des fils excédentaires et le repassage final");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelles étapes constituent les finitions soignées d'un vêtement ? (Plusieurs choix)"), "Le surjet ou le surfilage des bords intérieurs pour éviter l'effilochage", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelles étapes constituent les finitions soignées d'un vêtement ? (Plusieurs choix)") AND texte = "Le surjet ou le surfilage des bords intérieurs pour éviter l'effilochage");


-- Réponses - Q1 (Maintenance préventive)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel est l'objectif principal de la maintenance préventive par rapport à la maintenance curative ?"), "Anticiper et éviter les pannes avant qu'elles ne surviennent", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel est l'objectif principal de la maintenance préventive par rapport à la maintenance curative ?") AND texte = "Anticiper et éviter les pannes avant qu'elles ne surviennent");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quel est l'objectif principal de la maintenance préventive par rapport à la maintenance curative ?"), "Attendre l'arrêt complet de la machine pour intervenir", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quel est l'objectif principal de la maintenance préventive par rapport à la maintenance curative ?") AND texte = "Attendre l'arrêt complet de la machine pour intervenir");


-- Réponses - Q2 (Maintenance préventive - Vrai/Faux)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "La lubrification régulière des pièces mobiles en friction permet de réduire l'usure prématurée des machines."), "Vrai", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "La lubrification régulière des pièces mobiles en friction permet de réduire l'usure prématurée des machines.") AND texte = "Vrai");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "La lubrification régulière des pièces mobiles en friction permet de réduire l'usure prématurée des machines."), "Faux", FALSE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "La lubrification régulière des pièces mobiles en friction permet de réduire l'usure prématurée des machines.") AND texte = "Faux");


-- Réponses - Q3 (Maintenance préventive - Choix Multiple)
INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelles actions inclut généralement un plan de maintenance préventive ? (Plusieurs choix)"), "Les contrôles visuels et le nettoyage périodique", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelles actions inclut généralement un plan de maintenance préventive ? (Plusieurs choix)") AND texte = "Les contrôles visuels et le nettoyage périodique");

INSERT INTO proposition_reponse (id, question_id, texte, correcte)
SELECT UUID(), (SELECT id FROM question WHERE texte = "Quelles actions inclut généralement un plan de maintenance préventive ? (Plusieurs choix)"), "Le remplacement programmé de pièces d'usure", TRUE
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM proposition_reponse WHERE question_id = (SELECT id FROM question WHERE texte = "Quelles actions inclut généralement un plan de maintenance préventive ? (Plusieurs choix)") AND texte = "Le remplacement programmé de pièces d'usure");