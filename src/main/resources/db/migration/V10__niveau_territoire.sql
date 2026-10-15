-- Distingue les 19 régions du district de Bamako sans créer une table séparée.
-- Les territoires existants sont REGION par défaut; les variantes courantes du nom/code de Bamako sont reconnues.
ALTER TABLE region ADD COLUMN niveau VARCHAR(16) NOT NULL DEFAULT 'REGION';

UPDATE region
SET niveau = 'DISTRICT'
WHERE code_stable = 'ML-DIS-00'
   OR nom IN ('Bamako', 'District de Bamako');

CREATE INDEX idx_region_niveau ON region (niveau);
