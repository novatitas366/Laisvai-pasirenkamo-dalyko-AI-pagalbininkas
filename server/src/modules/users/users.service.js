import pool from '../../config/database.js'

export async function saveDominantSubjects(userId, subjectIds) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    await conn.execute(
      'DELETE FROM user_dominant_subjects WHERE user_id = ?',
      [userId]
    )

    if (subjectIds.length > 0) {
      const values = subjectIds.map((id) => [userId, id])
      await conn.query(
        'INSERT INTO user_dominant_subjects (user_id, subject_id) VALUES ?',
        [values]
      )
    }

    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
