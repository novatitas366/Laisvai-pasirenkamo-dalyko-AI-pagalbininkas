INSERT INTO users (email, password)
VALUES ('test@pavyzdys.lt', 'slaptas123')
ON DUPLICATE KEY UPDATE email = VALUES(email);
