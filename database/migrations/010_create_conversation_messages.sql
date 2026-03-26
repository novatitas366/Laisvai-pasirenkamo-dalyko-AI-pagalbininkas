CREATE TABLE IF NOT EXISTS conversation_messages (
  id              INT                          NOT NULL AUTO_INCREMENT,
  conversation_id INT                          NOT NULL,
  role            ENUM('user','assistant')      NOT NULL,
  content         TEXT                         NOT NULL,
  created_at      TIMESTAMP                    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_messages_conversation
    FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
