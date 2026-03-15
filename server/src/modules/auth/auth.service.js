import pool from '../../config/database.js'

/**
 * Finds a user by email using prepared statements to prevent SQL injection.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function findUserByEmail(email) {
  // Using .execute() ensures true server-side prepared statements in mysql2
  const [rows] = await pool.execute(
    'SELECT id, email, password FROM users WHERE email = ? LIMIT 1',
    [email]
  )
  return rows[0] || null
}
