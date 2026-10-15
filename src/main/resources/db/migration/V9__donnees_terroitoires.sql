-- Référentiel de noms selon le découpage du Mali : 19 régions + District de Bamako.

-- ==========================================
-- TABLE : region
-- ==========================================

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Kayes", "ML-REG-01" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Kayes");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Koulikoro", "ML-REG-02" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Koulikoro");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Sikasso", "ML-REG-03" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Sikasso");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Ségou", "ML-REG-04" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Ségou");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Mopti", "ML-REG-05" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Mopti");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Tombouctou", "ML-REG-06" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Tombouctou");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Gao", "ML-REG-07" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Gao");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Kidal", "ML-REG-08" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Kidal");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Taoudénit", "ML-REG-09" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Taoudénit");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Ménaka", "ML-REG-10" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Ménaka");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Nioro", "ML-REG-11" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Nioro");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Kita", "ML-REG-12" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Kita");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Dioïla", "ML-REG-13" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Dioïla");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Nara", "ML-REG-14" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Nara");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Bougouni", "ML-REG-15" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Bougouni");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Koutiala", "ML-REG-16" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Koutiala");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "San", "ML-REG-17" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "San");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Douentza", "ML-REG-18" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Douentza");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Bandiagara", "ML-REG-19" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Bandiagara");

INSERT INTO region (id, nom, code_stable)
SELECT UUID(), "Bamako", "ML-DIS-00" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM region WHERE nom = "Bamako");


-- ==========================================
-- TABLE : commune
-- ==========================================

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kayes"), "Kayes Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kayes Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kayes"), "Kayes Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kayes Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kayes"), "Kayes Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kayes Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Koulikoro"), "Koulikoro Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Koulikoro Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Koulikoro"), "Koulikoro Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Koulikoro Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Koulikoro"), "Koulikoro Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Koulikoro Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Sikasso"), "Sikasso Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Sikasso Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Sikasso"), "Sikasso Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Sikasso Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Sikasso"), "Sikasso Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Sikasso Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Ségou"), "Ségou Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Ségou Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Ségou"), "Ségou Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Ségou Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Ségou"), "Ségou Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Ségou Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Mopti"), "Mopti Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Mopti Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Mopti"), "Mopti Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Mopti Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Mopti"), "Mopti Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Mopti Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Tombouctou"), "Tombouctou Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Tombouctou Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Tombouctou"), "Tombouctou Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Tombouctou Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Tombouctou"), "Tombouctou Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Tombouctou Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Gao"), "Gao Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Gao Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Gao"), "Gao Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Gao Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Gao"), "Gao Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Gao Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kidal"), "Kidal Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kidal Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kidal"), "Kidal Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kidal Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kidal"), "Kidal Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kidal Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Taoudénit"), "Taoudénit Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Taoudénit Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Taoudénit"), "Taoudénit Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Taoudénit Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Taoudénit"), "Taoudénit Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Taoudénit Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Ménaka"), "Ménaka Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Ménaka Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Ménaka"), "Ménaka Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Ménaka Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Ménaka"), "Ménaka Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Ménaka Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bamako"), "Commune I" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Commune I");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bamako"), "Commune II" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Commune II");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bamako"), "Commune III" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Commune III");


INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bamako"), "Commune IV" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Commune IV");


INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bamako"), "Commune V" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Commune V");


INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bamako"), "Commune VI" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Commune VI");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Nioro"), "Nioro Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Nioro Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Nioro"), "Nioro Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Nioro Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Nioro"), "Nioro Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Nioro Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kita"), "Kita Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kita Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kita"), "Kita Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kita Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Kita"), "Kita Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Kita Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Dioïla"), "Dioïla Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Dioïla Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Dioïla"), "Dioïla Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Dioïla Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Dioïla"), "Dioïla Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Dioïla Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "San"), "San Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "San Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "San"), "San Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "San Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "San"), "San Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "San Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Douentza"), "Douentza Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Douentza Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Douentza"), "Douentza Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Douentza Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Douentza"), "Douentza Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Douentza Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bandiagara"), "Bandiagara Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Bandiagara Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bandiagara"), "Bandiagara Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Bandiagara Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Bandiagara"), "Bandiagara Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Bandiagara Sud");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Nara"), "Nara Centre" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Nara Centre");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Nara"), "Nara Nord" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Nara Nord");

INSERT INTO commune (id, region_id, nom)
SELECT UUID(), (SELECT id FROM region WHERE nom = "Nara"), "Nara Sud" FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM commune WHERE nom = "Nara Sud");