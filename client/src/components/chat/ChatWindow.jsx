import { useState, useRef, useEffect } from 'react'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'

export default function ChatWindow() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (msg) => {
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', ...msg }])

    // TODO: siųsti į API ir gauti DI atsakymą
    setLoading(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: 'Ačiū už klausimą! DI integracija bus pridėta vėliau.',
        },
      ])
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white border border-slate-200 rounded-2xl overflow-hidden">
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
