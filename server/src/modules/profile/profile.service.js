import pool from '../../config/database.js'

export async function getProfile(userId) {
  const [rows] = await pool.execute(
    `SELECT up.university_id, u.name AS university_name,
            up.study_program_id, sp.name AS study_program_name
     FROM user_profiles up
     LEFT JOIN universities u ON u.id = up.university_id
     LEFT JOIN study_programs sp ON sp.id = up.study_program_id
     WHERE up.user_id = ?`,
    [userId]
  )
  return rows[0] || null
}

export async function saveProfile(userId, universityId, studyProgramId) {
  const [existing] = await pool.execute(
    'SELECT id FROM user_profiles WHERE user_id = ?',
    [userId]
  )

  if (existing.length > 0) {
    await pool.execute(
      'UPDATE user_profiles SET university_id = ?, study_program_id = ? WHERE user_id = ?',
      [universityId || null, studyProgramId || null, userId]
    )
  } else {
    await pool.execute(
      'INSERT INTO user_profiles (user_id, university_id, study_program_id) VALUES (?, ?, ?)',
      [userId, universityId || null, studyProgramId || null]
    )
  }

  return getProfile(userId)
}
