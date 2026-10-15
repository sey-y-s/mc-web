

ALTER TABLE centre ADD COLUMN administrateur_id CHAR(36) NULL;
ALTER TABLE centre ADD CONSTRAINT fk_centre_administrateur
    FOREIGN KEY (administrateur_id) REFERENCES utilisateur(id);

CREATE TABLE evaluateur_centre (
    id CHAR(36) NOT NULL,
    citoyen_id CHAR(36) NOT NULL,
    centre_id CHAR(36) NOT NULL,
    designe_par_id CHAR(36) NOT NULL,
    specialite VARCHAR(200),
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    date_designation DATETIME NOT NULL,
    CONSTRAINT pk_evaluateur_centre PRIMARY KEY (id),
    CONSTRAINT uk_evaluateur_centre UNIQUE (citoyen_id, centre_id),
    CONSTRAINT fk_evaluateur_centre_citoyen
        FOREIGN KEY (citoyen_id) REFERENCES citoyen(id),
    CONSTRAINT fk_evaluateur_centre_centre
        FOREIGN KEY (centre_id) REFERENCES centre(id),
    CONSTRAINT fk_evaluateur_centre_designe_par
        FOREIGN KEY (designe_par_id) REFERENCES utilisateur(id)
) ENGINE=InnoDB;


-- -----------------------------------------------------------

ALTER TABLE region ADD COLUMN code_stable VARCHAR(32) NULL;
ALTER TABLE organisation ADD COLUMN motif_statut TEXT NULL;
ALTER TABLE indicateur_skills_gap ADD COLUMN effectif_contributeurs INT NULL;

CREATE UNIQUE INDEX uk_region_code_stable ON region (code_stable);
CREATE INDEX idx_skills_gap_cohort
    ON indicateur_skills_gap (competence_id, periode_debut, periode_fin);

CREATE TABLE audit_log (
    id CHAR(36) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    actor_id VARCHAR(100) NULL,
    action VARCHAR(80) NOT NULL,
    target_type VARCHAR(80) NOT NULL,
    target_id VARCHAR(100) NULL,
    result_code VARCHAR(24) NOT NULL,
    CONSTRAINT pk_audit_log PRIMARY KEY (id)
);
CREATE INDEX idx_audit_created_at ON audit_log (created_at);
CREATE INDEX idx_audit_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_target ON audit_log (target_type, target_id);