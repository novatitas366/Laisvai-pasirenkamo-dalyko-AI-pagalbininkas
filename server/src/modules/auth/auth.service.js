import argon2 from 'argon2'
import pool from '../../config/database.js'

/**
 * Finds a user by email using prepared statements to prevent SQL injection.
 * @param {string} email - The user's email address.
 * @returns {Promise<Object|null>} - The user object or null if not found.
 */
export async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, email, password_hash FROM users WHERE email = ? LIMIT 1',
    [email]
  )
  return rows[0] || null
}

export async function register(email, password) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  if (rows.length > 0) {
    const error = new Error('Email already in use')
    error.statusCode = 409
    throw error
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id })

  const [result] = await pool.execute(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    [email, passwordHash]
  )

  return { id: result.insertId, email }
}
