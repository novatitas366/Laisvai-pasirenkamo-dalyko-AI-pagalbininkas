import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import useProfile from '../../hooks/useProfile'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const bottomRef = useRef(null)
  const { profile, hasValidHobbies, isEmpty, buildSystemPrompt } = useProfile()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (msg) => {
    if (!hasValidHobbies) return

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

      {/* Profilio konteksto juosta */}
      <div className="border-b border-slate-100 px-4 py-2">
        <button
          onClick={() => setProfileOpen((v) => !v)}
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${isEmpty ? 'bg-amber-400' : 'bg-green-400'}`}
          />
          {isEmpty ? 'Profilis neužpildytas — atsakymai nebus personalizuoti' : `Profilis aktyvus: ${[profile.university, profile.studyProgram].filter(Boolean).join(', ')}`}
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

        {profileOpen && (
          <div className="mt-2 text-xs text-slate-500 space-y-0.5 pl-4 fade-in">
            {profile.university && <p><span className="text-slate-400">Universitetas:</span> {profile.university}</p>}
            {profile.studyProgram && <p><span className="text-slate-400">Studijų programa:</span> {profile.studyProgram}</p>}
            {profile.hobbies && <p><span className="text-slate-400">Hobiai:</span> {profile.hobbies}</p>}
            {isEmpty && (
              <p className="text-amber-500">
                Eikite į <a href="/profilis" className="underline">Mano profilį</a> ir užpildykite informaciją.
              </p>
            )}
          </div>
        )}
      </div>

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
    </div>
  )
}
