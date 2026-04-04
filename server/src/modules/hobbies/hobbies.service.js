import pool from '../../config/database.js'

export async function getHobbies(userId) {
  const [rows] = await pool.execute(
    'SELECT id, name, description FROM user_hobbies WHERE user_id = ? ORDER BY id',
    [userId]
  )
  return rows
}

export async function replaceHobbies(userId, hobbies) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute('DELETE FROM user_hobbies WHERE user_id = ?', [userId])
    for (const h of hobbies) {
      await conn.execute(
        'INSERT INTO user_hobbies (user_id, name, description) VALUES (?, ?, ?)',
        [userId, h.name.trim(), h.description?.trim() || null]
      )
    }
    await conn.commit()
    const [rows] = await conn.execute(
      'SELECT id, name, description FROM user_hobbies WHERE user_id = ? ORDER BY id',
      [userId]
    )
    return rows
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
