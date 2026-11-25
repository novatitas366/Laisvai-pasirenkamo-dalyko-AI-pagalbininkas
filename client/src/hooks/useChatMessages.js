import { useState, useEffect } from 'react'
import api from '../services/api'

const SESSION_KEY = 'chat_new_messages'
const ERROR_REPLY = 'Atsiprašome, įvyko klaida. Bandykite dar kartą.'

function loadSavedMessages() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    return saved ? JSON.parse(saved) : []
  } catch { return [] }
}

function toApiMessages(messages) {
  return messages
    .map((m) => ({ role: m.role, content: m.text || m.content || '' }))
    .filter((m) => m.content)
}

// Pokalbio žinutės: naujo pokalbio išsaugojimas sessionStorage,
// esamo pokalbio istorijos krovimas ir žinutės siuntimas AI.
export default function useChatMessages(id, buildSystemPrompt) {
  const [messages, setMessages] = useState(() => (id ? [] : loadSavedMessages()))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) return
    if (messages.length > 0) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages))
    } else {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }, [messages, id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.get(`/conversations/${id}`)
      .then(res => setMessages(res.data))
      .catch(err => console.error('Failed to load messages', err))
      .finally(() => setLoading(false))
  }, [id])

  const sendMessage = async (msg) => {
    const userMessage = { id: Date.now(), role: 'user', ...msg }
    setMessages((prev) => [...prev, userMessage])
    setLoading(true)

    try {
      const systemPrompt = buildSystemPrompt()
      const allMessages = toApiMessages([...messages, userMessage])
      const res = await api.post('/chat', { systemPrompt, messages: allMessages })
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: res.data.text }])
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', text: ERROR_REPLY }])
    } finally {
      setLoading(false)
    }
  }

  return { messages, loading, sendMessage }
}
