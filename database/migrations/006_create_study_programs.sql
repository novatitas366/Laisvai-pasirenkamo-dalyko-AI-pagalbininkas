CREATE TABLE IF NOT EXISTS study_programs (
  id         INT           NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255)  NOT NULL,
  code       VARCHAR(50)   NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_study_programs_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
