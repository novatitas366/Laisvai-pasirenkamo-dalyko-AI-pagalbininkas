CREATE TABLE IF NOT EXISTS recommendation_sessions (
  id          INT       NOT NULL AUTO_INCREMENT,
  user_id     INT       NULL,
  input_data  JSON      NOT NULL,
  ai_response JSON      NOT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_recommendations_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
