-- Testinis naudotojas (slaptažodis: slaptazodis123, bcrypt hash)
INSERT IGNORE INTO users (email, password_hash) VALUES
  ('testas@pavyzdys.lt', '$2b$10$EIXe0e0e0e0e0e0e0e0e0eUIYof5FMm0dDL7vFh7v8n0v0KjZnKuS');

-- Admin paskyra (slaptažodis: Admin123@, argon2id hash)
INSERT IGNORE INTO users (email, password_hash) VALUES
  ('admin@admin.lt', '$argon2id$v=19$m=65536,t=3,p=4$sI8VkEr0FV1vjeYCt03Zqw$aoa9FJ4fjML7nQlV53gmytXr7eyarT5/cdOmN8ynPvw');
