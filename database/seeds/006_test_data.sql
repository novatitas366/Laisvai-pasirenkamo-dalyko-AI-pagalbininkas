-- Testiniai hobiai naudotojui 1
INSERT IGNORE INTO user_hobbies (user_id, name, description) VALUES
  (1, 'Programavimas', 'Kuriu asmeninius projektus su JavaScript ir Python'),
  (1, 'Skaitymas',     'Mėgstu skaityti apie technologijas ir mokslą');

-- Testiniai pasirenkamieji dalykai naudotojui 1
INSERT IGNORE INTO user_elective_courses (user_id, name, credits, description) VALUES
  (1, 'Žaidimų kūrimas',       4, 'Kompiuterinių žaidimų projektavimas ir programavimas'),
  (1, 'Duomenų vizualizacija',  3, 'Duomenų atvaizdavimo metodai ir įrankiai');

-- Testinis pokalbis
INSERT IGNORE INTO conversations (id, user_id, title) VALUES
  (1, 1, 'Kokius dalykus rinktis 5 semestre?');

INSERT IGNORE INTO conversation_messages (conversation_id, role, content) VALUES
  (1, 'user',      'Kokius pasirenkamus dalykus rekomenduotum 5 semestre?'),
  (1, 'assistant', 'Remiantis jūsų studijų programa ir hobiais, rekomenduočiau Mašinų mokymasis ir Interneto technologijos.');
