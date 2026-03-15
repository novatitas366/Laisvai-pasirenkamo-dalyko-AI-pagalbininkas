import argon2 from 'argon2'
import pool from '../../config/database.js'

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
