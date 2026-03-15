import { useState } from 'react'

function HobbyEntry({ hobby, onRemove, onChange }) {
  return (
    <div className="border border-slate-200 rounded-xl mb-3">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
          <span className="text-sm font-medium text-slate-700">
            {hobby.name || 'Be pavadinimo'}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
          <input
            type="text"
            placeholder="Pavadinimas"
            value={hobby.name}
            onChange={e => onChange({ ...hobby, name: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>
        <textarea
          placeholder="Aprašymas (neprivaloma)"
          value={hobby.description}
          onChange={e => onChange({ ...hobby, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  )
}

export default function HobbiesForm() {
  const [hobbies, setHobbies] = useState([{ id: 1, name: '', description: '' }])

  const addHobby = () => {
    setHobbies(prev => [...prev, { id: Date.now(), name: '', description: '' }])
  }

  const removeHobby = (id) => {
    setHobbies(prev => prev.filter(h => h.id !== id))
  }

  const updateHobby = (id, updated) => {
    setHobbies(prev => prev.map(h => h.id === id ? updated : h))
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6">
      {hobbies.map(hobby => (
        <HobbyEntry
          key={hobby.id}
          hobby={hobby}
          onRemove={() => removeHobby(hobby.id)}
          onChange={updated => updateHobby(hobby.id, updated)}
        />
      ))}

      <button
        onClick={addHobby}
        className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors bg-slate-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Pridėti hobį
      </button>
    </div>
  )
}
