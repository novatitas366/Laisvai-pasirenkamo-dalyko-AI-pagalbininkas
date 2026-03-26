import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import useProfile from '../../hooks/useProfile'
import api from '../../services/api'
import Toast from '../ui/Toast'

export default function ChatWindow() {
  const { id } = useParams()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showHobbyWarning, setShowHobbyWarning] = useState(false)
  const bottomRef = useRef(null)
  const { profile, hasValidHobbies, isEmpty, buildSystemPrompt } = useProfile()

  // Load chat history from API
  useEffect(() => {
    if (id) {
      setLoading(true)
      // Fetch messages
      api.get(`/conversations/${id}`)
        .then(res => setMessages(res.data))
        .catch(err => console.error('Failed to load messages', err))
        .finally(() => setLoading(false))

      // Fetch conversation list to get the title (simplified for now)
      api.get('/conversations')
        .then(res => {
          const conv = res.data.find(c => String(c.id) === id)
          if (conv) setTitle(conv.title)
        })
    } else {
      setMessages([])
      setTitle('')
    }
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleRename = async () => {
    if (!id || !title.trim()) return
    
    // SCRUM-79: Truncate title before sending
    const finalTitle = title.trim().substring(0, 100)
    
    try {
      await api.patch(`/conversations/${id}/rename`, { title: finalTitle })
      setIsEditingTitle(false)
      // Dispatch custom event to notify Sidebar
      window.dispatchEvent(new CustomEvent('conversation-renamed', { detail: { id, title: finalTitle } }))
    } catch (err) {
      console.error('Failed to rename', err)
    }
  }

  const handleSend = (msg) => {
    if (!hasValidHobbies) {
      setShowHobbyWarning(true)
      return
    }

    const userMessage = { id: Date.now(), role: 'user', ...msg }
    setMessages((prev) => [...prev, userMessage])

    // Sistemos promptas su vartotojo profiliu (bus naudojamas kai API bus prijungtas)
    const systemPrompt = buildSystemPrompt()
    console.log('System prompt:', systemPrompt)

    // TODO: siųsti į API su systemPrompt ir messages
    setLoading(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: isEmpty
            ? 'Užpildykite profilį skiltyje „Mano profilis", kad galėčiau pateikti personalizuotas rekomendacijas.'
            : 'DI atsakymas bus rodomas čia su rekomendacijomis ir argumentais kai API bus prijungtas.',
        },
      ])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white border border-slate-200 rounded-2xl overflow-hidden">
      
      {/* Title Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              autoFocus
              type="text"
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
              onBlur={handleRename}
              className="flex-1 px-3 py-1 text-sm font-medium border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            />
            <span className="text-[10px] text-slate-400 font-mono">{title.length}/100</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => id && setIsEditingTitle(true)}>
            <h2 className="text-sm font-bold text-slate-700 truncate max-w-[300px]">
              {id ? (title || 'Bevardis pokalbis') : 'Nauja rekomendacija'}
            </h2>
            {id && (
              <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${isEmpty ? 'bg-amber-400' : 'bg-green-400'}`}
            />
            <span className="hidden sm:inline">{isEmpty ? 'Profilis neužpildytas' : 'Profilis aktyvus'}</span>
            <svg
              className={`w-3 h-3 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Profilio detalių išskleidimas */}
      {profileOpen && (
        <div className="bg-slate-50 border-b border-slate-100 p-4 text-xs text-slate-500 space-y-0.5 animate-in slide-in-from-top-1">
          {profile.university && <p><span className="text-slate-400">Universitetas:</span> {profile.university}</p>}
          {profile.studyProgram && <p><span className="text-slate-400">Studijų programa:</span> {profile.studyProgram}</p>}
          {profile.hobbies && <p><span className="text-slate-400">Hobiai:</span> {profile.hobbies}</p>}
          {isEmpty && (
            <p className="text-amber-500">
              Eikite į <a href="/profilis" className="underline font-bold">Mano profilį</a> ir užpildykite informaciją.
            </p>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700 mb-1">Užduokite klausimą</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Klauskite apie pasirenkamus dalykus ir gaukite personalizuotas rekomendacijas
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
              <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />

      {showHobbyWarning && (
        <Toast
          message='Pridėkite bent vieną tinkamą hobį skiltyje „Hobiai" prieš generuojant rekomendacijas.'
          onClose={() => setShowHobbyWarning(false)}
        />
      )}
    </div>
  )
}
