CREATE TABLE IF NOT EXISTS user_profiles (
  id            INT          NOT NULL AUTO_INCREMENT,
  user_id       INT          NOT NULL,
  university_id INT          NULL,
  profile_name  VARCHAR(255) NOT NULL DEFAULT 'Pagrindinis profilis',
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_profiles_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_profiles_university
    FOREIGN KEY (university_id) REFERENCES universities (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
