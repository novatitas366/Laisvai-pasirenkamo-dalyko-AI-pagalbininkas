-- VU (id=1)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (1, 'Informatika',                  'VU-INF'),
  (1, 'Matematika',                   'VU-MAT'),
  (1, 'Fizika',                       'VU-FIZ'),
  (1, 'Programų sistemos',            'VU-PS'),
  (1, 'Kibernetinis saugumas',        'VU-KS');

-- KTU (id=2)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (2, 'Programų sistemos',            'KTU-PS'),
  (2, 'Elektronikos inžinerija',      'KTU-EL'),
  (2, 'Elektros inžinerija',          'KTU-EEI'),
  (2, 'Mechanikos inžinerija',        'KTU-MECH'),
  (2, 'Taikomoji matematika',         'KTU-TMAT');

-- VGTU (id=3)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (3, 'Kibernetinis saugumas',        'VGTU-KS'),
  (3, 'Taikomoji matematika',         'VGTU-TMAT'),
  (3, 'Informatika',                  'VGTU-INF'),
  (3, 'Verslo informatika',           'VGTU-VINF'),
  (3, 'Elektronikos inžinerija',      'VGTU-EL'),
  (3, 'Mechanikos inžinerija',        'VGTU-MECH');

-- VDU (id=4)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (4, 'Verslo informatika',           'VDU-VINF'),
  (4, 'Informatika',                  'VDU-INF'),
  (4, 'Taikomoji matematika',         'VDU-TMAT');

-- KU (id=5)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (5, 'Informatika',                  'KU-INF'),
  (5, 'Verslo informatika',           'KU-VINF');

-- MRU (id=6)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (6, 'Verslo informatika',           'MRU-VINF'),
  (6, 'Kibernetinis saugumas',        'MRU-KS'),
  (6, 'Teisė',                        'MRU-TEI');

-- ŠU (id=7)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (7, 'Informatika',                  'SU-INF'),
  (7, 'Edukologija',                  'SU-EDU');

-- LSMU (id=8)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (8, 'Medicina',                     'LSMU-MED'),
  (8, 'Farmacija',                    'LSMU-FARM');

-- LSU (id=9)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (9, 'Sporto ir rekreacinė veikla',  'LSU-SRV'),
  (9, 'Sporto edukologija',           'LSU-SEDU');
