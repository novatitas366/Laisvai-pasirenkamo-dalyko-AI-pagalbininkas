export function EmptyChat() {
  return (
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
  )
}

export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
        <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
        <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
        <span className="w-2 h-2 bg-slate-400 rounded-full typing-dot" />
      </div>
    </div>
  )
}
