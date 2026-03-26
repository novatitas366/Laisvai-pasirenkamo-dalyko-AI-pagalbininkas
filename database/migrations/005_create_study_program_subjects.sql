CREATE TABLE IF NOT EXISTS study_program_subjects (
  id               INT          NOT NULL AUTO_INCREMENT,
  study_program_id INT          NOT NULL,
  name             VARCHAR(255) NOT NULL,
  code             VARCHAR(50)  NOT NULL,
  semester         TINYINT      NOT NULL,
  credits          DECIMAL(3,1) NOT NULL DEFAULT 0,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_subjects_program
    FOREIGN KEY (study_program_id) REFERENCES study_programs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
