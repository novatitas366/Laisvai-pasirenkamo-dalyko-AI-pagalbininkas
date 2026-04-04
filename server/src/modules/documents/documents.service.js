import pool from '../../config/database.js'

export async function listDocumentsByUser(userId) {
  const [rows] = await pool.execute(
    `SELECT id, original_name, mime_type, size_bytes, created_at
     FROM documents
     WHERE user_id = ?
     ORDER BY created_at DESC`,
    [userId]
  )
  return rows
}

export async function getDocumentForUser(userId, documentId) {
  const [rows] = await pool.execute(
    `SELECT id, original_name, mime_type, size_bytes, extracted_text, created_at
     FROM documents
     WHERE id = ? AND user_id = ?`,
    [documentId, userId]
  )
  return rows[0] ?? null
}

export async function deleteDocumentForUser(userId, documentId) {
  const [result] = await pool.execute(
    `DELETE FROM documents WHERE id = ? AND user_id = ?`,
    [documentId, userId]
  )
  return result.affectedRows > 0
}
