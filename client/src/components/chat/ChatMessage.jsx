export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? 'bg-brand-600 text-white rounded-br-md'
            : 'bg-white border border-slate-200 text-slate-700 rounded-bl-md'
        }`}
      >
        {message.image && (
          <img
            src={message.image}
            alt="Pridėta nuotrauka"
            className="max-w-full max-h-48 rounded-lg mb-2"
          />
        )}
        {message.text && <p className="whitespace-pre-wrap">{message.text}</p>}
      </div>
    </div>
  )
}
