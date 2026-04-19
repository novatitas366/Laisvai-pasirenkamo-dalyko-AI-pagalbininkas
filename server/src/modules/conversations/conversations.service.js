import pool from '../../config/database.js'

export async function getConversations() {
  const [rows] = await pool.query(
    'SELECT id, title, created_at AS date, updated_at FROM conversations ORDER BY updated_at DESC'
  )
  return rows
}

export async function getMessagesByConversationId(id) {
  const conversationId = parseInt(id, 10)
  if (isNaN(conversationId)) return null

  const [conversations] = await pool.execute(
    'SELECT id FROM conversations WHERE id = ?',
    [conversationId]
  )
  if (conversations.length === 0) return null

  const [messages] = await pool.execute(
    'SELECT id, role, content, created_at FROM conversation_messages WHERE conversation_id = ? ORDER BY created_at',
    [conversationId]
  )
  return messages
}

export async function renameConversation(id, newTitle) {
  const conversationId = parseInt(id, 10)
  if (isNaN(conversationId)) return null

  // SCRUM-79: Limit title to 100 characters
  const truncatedTitle = newTitle.substring(0, 100)

  const [result] = await pool.execute(
    'UPDATE conversations SET title = ? WHERE id = ?',
    [truncatedTitle, conversationId]
  )

  if (result.affectedRows === 0) return null

  const [rows] = await pool.execute(
    'SELECT id, title, created_at AS date, updated_at FROM conversations WHERE id = ?',
    [conversationId]
  )
  return rows[0] || null
}
