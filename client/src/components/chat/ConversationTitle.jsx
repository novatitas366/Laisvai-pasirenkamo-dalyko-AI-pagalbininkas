import { useState } from 'react'

export default function ConversationTitle({ id, title, setTitle, onRename, maxLength }) {
  const [isEditing, setIsEditing] = useState(false)

  const handleRename = async () => {
    if (await onRename()) setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <input
          autoFocus
          type="text"
          value={title}
          maxLength={maxLength}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          onBlur={handleRename}
          className="flex-1 px-3 py-1 text-sm font-medium border border-brand-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
        <span className="text-[10px] text-slate-400 font-mono">{title.length}/{maxLength}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => id && setIsEditing(true)}>
      <h2 className="text-sm font-bold text-slate-700 truncate max-w-[300px]">
        {id ? (title || 'Bevardis pokalbis') : 'Nauja rekomendacija'}
      </h2>
      {id && (
        <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-brand-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
      )}
    </div>
  )
}
