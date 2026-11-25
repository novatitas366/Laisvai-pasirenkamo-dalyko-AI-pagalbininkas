import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ChatMessage from './ChatMessage'
import ChatInput from './ChatInput'
import ConversationTitle from './ConversationTitle'
import { ProfileToggle, ProfileDetails } from './ProfileStatus'
import { EmptyChat, TypingIndicator } from './ChatPlaceholders'
import useProfile from '../../hooks/useProfile'
import useChatMessages from '../../hooks/useChatMessages'
import useConversationTitle from '../../hooks/useConversationTitle'

export default function ChatWindow() {
  const { id } = useParams()
  const { profile, isEmpty, hasValidHobbies, buildSystemPrompt } = useProfile()
  const { messages, loading, sendMessage } = useChatMessages(id, buildSystemPrompt)
  const { title, setTitle, rename, maxLength } = useConversationTitle(id)
  const [profileOpen, setProfileOpen] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white border border-slate-200 rounded-2xl overflow-hidden">

      {/* Title Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <ConversationTitle id={id} title={title} setTitle={setTitle} onRename={rename} maxLength={maxLength} />
        <div className="flex items-center gap-4">
          <ProfileToggle isEmpty={isEmpty} open={profileOpen} onToggle={() => setProfileOpen((v) => !v)} />
        </div>
      </div>

      {profileOpen && <ProfileDetails profile={profile} hasValidHobbies={hasValidHobbies} isEmpty={isEmpty} />}

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && <EmptyChat />}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatInput onSend={sendMessage} disabled={loading} />

    </div>
  )
}
