ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS study_program_id INT NULL,
  ADD CONSTRAINT fk_profiles_study_program
    FOREIGN KEY (study_program_id) REFERENCES study_programs (id) ON DELETE SET NULL;
