CREATE TABLE IF NOT EXISTS user_hobbies (
  id          INT          NOT NULL AUTO_INCREMENT,
  user_id     INT          NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_hobbies_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
