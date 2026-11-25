export function LoadingIndicator({ text, padding }) {
  return (
    <div className={`flex items-center gap-3 text-slate-400 ${padding}`}>
      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
      <span className="text-sm">{text}</span>
    </div>
  )
}

export function ErrorMessage({ message }) {
  return (
    <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
      {message}
    </div>
  )
}
