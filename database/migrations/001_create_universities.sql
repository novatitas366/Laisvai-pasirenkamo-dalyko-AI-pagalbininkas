CREATE TABLE IF NOT EXISTS universities (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(255) NOT NULL,
  short_name VARCHAR(50)  NOT NULL,
  city       VARCHAR(100) NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_universities_short_name (short_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
