import pool from '../../config/database.js'

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, email, password FROM users WHERE email = ?',
    [email]
  )
  return rows[0]
}
