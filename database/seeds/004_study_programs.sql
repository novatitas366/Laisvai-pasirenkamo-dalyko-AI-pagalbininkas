-- VU (id=1)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (1, 'Informatika',            'VU-INF'),
  (1, 'Matematika',             'VU-MAT'),
  (1, 'Fizika',                 'VU-FIZ');

-- KTU (id=2)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (2, 'Programų sistemos',       'KTU-PS'),
  (2, 'Elektronikos inžinerija', 'KTU-EL'),
  (2, 'Elektros inžinerija',    'KTU-EEI'),
  (2, 'Mechanikos inžinerija',  'KTU-MECH');

-- VGTU (id=3)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (3, 'Kibernetinis saugumas',   'VGTU-KS'),
  (3, 'Taikomoji matematika',   'VGTU-TMAT');

-- VDU (id=4)
INSERT IGNORE INTO study_programs (university_id, name, code) VALUES
  (4, 'Verslo informatika',      'VDU-VINF');
