import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../../data')

export async function getConversations() {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'conversations.json'), 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading conversations:', error)
    return []
  }
}

export async function getMessagesByConversationId(id) {
  try {
    const data = await fs.readFile(path.join(DATA_DIR, 'messages.json'), 'utf8')
    const allMessages = JSON.parse(data)
    return allMessages[id] || null
  } catch (error) {
    console.error('Error reading messages:', error)
    return null
  }
}
