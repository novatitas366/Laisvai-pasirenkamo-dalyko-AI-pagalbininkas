import { useState, useEffect } from 'react'
import api from '../services/api'

const MAX_TITLE_LENGTH = 100

// Pokalbio pavadinimo krovimas ir pervadinimas.
export default function useConversationTitle(id) {
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!id) {
      setTitle('')
      return
    }
    api.get('/conversations')
      .then(res => {
        const conv = res.data.find(c => String(c.id) === id)
        if (conv) setTitle(conv.title)
      })
      .catch(err => console.error('Failed to load conversation title', err))
  }, [id])

  // Grąžina true, jei pavadinimas išsaugotas.
  const rename = async () => {
    if (!id || !title.trim()) return false

    // SCRUM-79: Truncate title before sending
    const finalTitle = title.trim().substring(0, MAX_TITLE_LENGTH)

    try {
      await api.patch(`/conversations/${id}/rename`, { title: finalTitle })
      // Dispatch custom event to notify Sidebar
      window.dispatchEvent(new CustomEvent('conversation-renamed', { detail: { id, title: finalTitle } }))
      return true
    } catch (err) {
      console.error('Failed to rename', err)
      return false
    }
  }

  return { title, setTitle, rename, maxLength: MAX_TITLE_LENGTH }
}
