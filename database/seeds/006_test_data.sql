-- Testiniai hobiai naudotojui 1
INSERT IGNORE INTO user_hobbies (user_id, name, description) VALUES
  (1, 'Programavimas', 'Kuriu asmeninius projektus su JavaScript ir Python'),
  (1, 'Skaitymas',     'Mėgstu skaityti apie technologijas ir mokslą');

-- Testiniai pasirenkamieji dalykai naudotojui 1
INSERT IGNORE INTO user_elective_courses (user_id, name, credits, description) VALUES
  (1, 'Žaidimų kūrimas',       4, 'Kompiuterinių žaidimų projektavimas ir programavimas'),
  (1, 'Duomenų vizualizacija',  3, 'Duomenų atvaizdavimo metodai ir įrankiai');

-- Testiniai pokalbiai naudotojui 1
INSERT IGNORE INTO conversations (id, user_id, title, created_at, updated_at) VALUES
  (1, 1, 'Kokius dalykus rinktis 5 semestre?',         '2026-04-16 08:00:00', '2026-04-16 08:00:00'),
  (2, 1, 'Ar verta rinktis Duomenų mokslą?',            '2026-04-17 10:30:00', '2026-04-17 10:30:00'),
  (3, 1, 'Dirbtinio intelekto kursų palyginimas',       '2026-04-18 14:00:00', '2026-04-18 14:00:00'),
  (4, 1, 'Kibernetinio saugumo įvado dalyko apžvalga',  '2026-04-19 09:15:00', '2026-04-19 09:15:00'),
  (5, 1, 'Programų inžinerijos magistrantūra',          '2026-04-20 11:00:00', '2026-04-20 11:00:00');

INSERT IGNORE INTO conversation_messages (conversation_id, role, content) VALUES
  (1, 'user',      'Kokius pasirenkamus dalykus rekomenduotum 5 semestre?'),
  (1, 'assistant', 'Rekomenduočiau Mašinų mokymasis ir Interneto technologijos.'),
  (2, 'user',      'Ar Duomenų mokslas tinka programų inžinerijos studentui?'),
  (2, 'assistant', 'Taip, puikiai papildo – ypač jei domina duomenų analizė.'),
  (3, 'user',      'Kuo skiriasi skirtingi DI kursai?'),
  (3, 'assistant', 'Mašinų mokymasis labiau matematinis, Dirbtinis intelektas apima platesnes temas.'),
  (4, 'user',      'Ką apima Kibernetinio saugumo įvado dalykas?'),
  (4, 'assistant', 'Dalykas apima tinklų saugumą, kriptografiją ir pažeidžiamumų analizę.'),
  (5, 'user',      'Kokios magistrantūros galimybės baigus programų inžineriją?'),
  (5, 'assistant', 'Galite rinktis Programų sistemų, Duomenų mokslo arba Kibernetinio saugumo magistrantūrą.');
