CREATE TABLE IF NOT EXISTS documents (
  id             INT          NOT NULL AUTO_INCREMENT,
  user_id        INT          NOT NULL,
  filename       VARCHAR(255) NOT NULL,
  original_name  VARCHAR(255) NOT NULL,
  mime_type      VARCHAR(100) NOT NULL,
  size_bytes     INT          NOT NULL,
  extracted_text MEDIUMTEXT   NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_documents_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
