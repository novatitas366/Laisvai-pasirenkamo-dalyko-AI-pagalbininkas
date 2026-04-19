-- Testinis naudotojas (slaptažodis: slaptazodis123, argon2id hash)
INSERT IGNORE INTO users (email, password_hash) VALUES
  ('testas@pavyzdys.lt', '$argon2id$v=19$m=65536,t=3,p=4$vbHKzvtPEwb4UTHDhMOaRg$T25Dbed+ev6B6RmO19K+CSIv0MU4SreUFWhf3TMaM5Q');

-- Admin paskyra (slaptažodis: Admin123@, argon2id hash)
INSERT IGNORE INTO users (email, password_hash) VALUES
  ('admin@admin.lt', '$argon2id$v=19$m=65536,t=3,p=4$sI8VkEr0FV1vjeYCt03Zqw$aoa9FJ4fjML7nQlV53gmytXr7eyarT5/cdOmN8ynPvw');
