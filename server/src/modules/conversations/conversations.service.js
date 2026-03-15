import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '../../data')
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json')

export async function getConversations() {
  try {
    const data = await fs.readFile(CONVERSATIONS_FILE, 'utf8')
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

export async function renameConversation(id, newTitle) {
  try {
    const conversations = await getConversations()
    const index = conversations.findIndex(c => c.id === id)
    
    if (index === -1) return null

    // SCRUM-79: Limit title to 100 characters
    const truncatedTitle = newTitle.substring(0, 100)
    
    conversations[index].title = truncatedTitle
    
    await fs.writeFile(CONVERSATIONS_FILE, JSON.stringify(conversations, null, 2))
    return conversations[index]
  } catch (error) {
    console.error('Error renaming conversation:', error)
    throw error
  }
}
