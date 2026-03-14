-- Informatika (id=1)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (1, 'Programavimo pagrindai',       'INF-101', 1, 6.0),
  (1, 'Diskretinė matematika',        'INF-102', 1, 5.0),
  (1, 'Duomenų struktūros',           'INF-201', 2, 6.0),
  (1, 'Algoritmų teorija',            'INF-202', 2, 5.0),
  (1, 'Duomenų bazės',                'INF-301', 3, 5.0),
  (1, 'Operacinės sistemos',          'INF-302', 3, 4.0);

-- Programų sistemos (id=2)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (2, 'Objektinis programavimas',     'PS-101',  1, 6.0),
  (2, 'Programų inžinerija',          'PS-201',  2, 5.0),
  (2, 'Komponentų architektūra',      'PS-301',  3, 4.0),
  (2, 'Testavimas ir kokybė',         'PS-302',  3, 4.0);

-- Matematika (id=3)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (3, 'Matematinė analizė I',         'MAT-101', 1, 6.0),
  (3, 'Tiesinė algebra',              'MAT-102', 1, 5.0),
  (3, 'Matematinė analizė II',        'MAT-201', 2, 6.0),
  (3, 'Tikimybių teorija',            'MAT-301', 3, 5.0);

-- Taikomoji matematika (id=4)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (4, 'Skaitiniai metodai',           'TMAT-101',1, 6.0),
  (4, 'Optimizavimo teorija',         'TMAT-201',2, 5.0),
  (4, 'Statistika ir duomenų analizė','TMAT-301',3, 5.0);

-- Fizika (id=5)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (5, 'Mechanika',                    'FIZ-101', 1, 6.0),
  (5, 'Elektromagnetizmas',           'FIZ-201', 2, 5.0),
  (5, 'Kvantinė fizika',              'FIZ-301', 3, 5.0);

-- Elektronikos inžinerija (id=6)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (6, 'Elektronikos pagrindai',       'EL-101',  1, 6.0),
  (6, 'Skaitmeninė elektronika',      'EL-201',  2, 5.0),
  (6, 'Įterptinės sistemos',          'EL-301',  3, 5.0),
  (6, 'Signalų apdorojimas',          'EL-302',  3, 4.0);

-- Elektros inžinerija (id=7)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (7, 'Elektros grandinės',           'EEI-101', 1, 6.0),
  (7, 'Elektros mašinos',             'EEI-201', 2, 5.0),
  (7, 'Energetikos sistemos',         'EEI-301', 3, 5.0);

-- Mechanikos inžinerija (id=8)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (8, 'Inžinerinė mechanika',         'MECH-101',1, 6.0),
  (8, 'Termodinamika',                'MECH-201',2, 5.0),
  (8, 'Medžiagų mechanika',           'MECH-301',3, 5.0);

-- Verslo informatika (id=9)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (9, 'Informacinės sistemos',        'VINF-101',1, 6.0),
  (9, 'Verslo procesai',              'VINF-102',1, 4.0),
  (9, 'Duomenų analizė verslui',      'VINF-201',2, 5.0),
  (9, 'ERP sistemos',                 'VINF-301',3, 4.0);

-- Kibernetinis saugumas (id=10)
INSERT INTO study_program_subjects (study_program_id, name, code, semester, credits) VALUES
  (10, 'Tinklų pagrindai',            'KS-101',  1, 5.0),
  (10, 'Kriptografija',               'KS-201',  2, 5.0),
  (10, 'Sistemos saugumas',           'KS-202',  2, 5.0),
  (10, 'Etinis įsilaužimas',          'KS-301',  3, 4.0);
