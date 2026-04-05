CREATE TABLE IF NOT EXISTS user_dominant_subjects (
  id         INT       NOT NULL AUTO_INCREMENT,
  user_id    INT       NOT NULL,
  subject_id INT       NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_subject (user_id, subject_id),
  CONSTRAINT fk_dominant_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_dominant_subject
    FOREIGN KEY (subject_id) REFERENCES study_program_subjects (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
