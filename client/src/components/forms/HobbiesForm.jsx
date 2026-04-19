import { useState, useEffect, useRef } from 'react'
import { loadHobbies, MIN_HOBBY_NAME_LENGTH } from '../../utils/hobbyValidation'
import api from '../../services/api'

const NAME_MAX = 20
const DESC_MAX = 150
const MAX_HOBBIES = 10
const STORAGE_KEY = 'hobbies'

function saveToStorage(hobbies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hobbies))
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-600 mb-1">Nėra pridėtų hobių</p>
      <p className="text-xs text-slate-400">Pavyzdžiui: Programavimas, Fotografija, Muzika</p>
    </div>
  )
}

function HobbyEntry({ hobby, onRemove, onChange }) {
  const nameTooShort = hobby.name.trim().length > 0 && hobby.name.trim().length < MIN_HOBBY_NAME_LENGTH
  const nameError = hobby.name.length > NAME_MAX
  const descError = hobby.description.length > DESC_MAX

  return (
    <div className="border border-slate-200 rounded-xl mb-3">
      <div className="p-4 flex flex-col gap-3">
        <div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
            <input
              type="text"
              placeholder={`Pavadinimas (min. ${MIN_HOBBY_NAME_LENGTH} simboliai)`}
              value={hobby.name}
              onChange={e => onChange({ ...hobby, name: e.target.value })}
              className={`w-full pl-9 pr-4 py-2.5 border rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent ${
                nameError
                  ? 'border-red-400 focus:ring-red-400'
                  : nameTooShort
                  ? 'border-amber-300 focus:ring-amber-400'
                  : 'border-slate-200 focus:ring-brand-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between mt-1 px-1">
            {nameError
              ? <p className="text-xs text-red-500">Pavadinimas negali viršyti {NAME_MAX} simbolių</p>
              : nameTooShort
              ? <p className="text-xs text-amber-500">Pavadinimas per trumpas (min. {MIN_HOBBY_NAME_LENGTH} simboliai)</p>
              : <span />
            }
            <p className={`text-xs ml-auto ${nameError ? 'text-red-500' : 'text-slate-400'}`}>
              {hobby.name.length}/{NAME_MAX}
            </p>
          </div>
        </div>
        <div>
          <textarea
            placeholder={`Aprašymas (min. ${MIN_HOBBY_NAME_LENGTH} simboliai)`}
            value={hobby.description}
            onChange={e => onChange({ ...hobby, description: e.target.value })}
            rows={3}
            className={`w-full px-4 py-2.5 border rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
              descError
                ? 'border-red-400 focus:ring-red-400'
                : hobby.description.trim().length > 0 && hobby.description.trim().length < MIN_HOBBY_NAME_LENGTH
                ? 'border-amber-300 focus:ring-amber-400'
                : 'border-slate-200 focus:ring-brand-500'
            }`}
          />
          <div className="flex items-center justify-between mt-1 px-1">
            {descError
              ? <p className="text-xs text-red-500">Aprašymas negali viršyti {DESC_MAX} simbolių</p>
              : hobby.description.trim().length > 0 && hobby.description.trim().length < MIN_HOBBY_NAME_LENGTH
              ? <p className="text-xs text-amber-500">Aprašymas per trumpas (min. {MIN_HOBBY_NAME_LENGTH} simboliai)</p>
              : <span />
            }
            <p className={`text-xs ml-auto ${descError ? 'text-red-500' : 'text-slate-400'}`}>
              {hobby.description.length}/{DESC_MAX}
            </p>
          </div>
        </div>
        <div className="flex justify-start">
          <button
            onClick={onRemove}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Pašalinti
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HobbiesForm() {
  const [hobbies, setHobbies] = useState([])
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const saveRef = useRef(false)

  const canSave = hobbies.length === 0 || hobbies.every(h =>
    h.name.trim().length >= MIN_HOBBY_NAME_LENGTH &&
    h.name.length <= NAME_MAX &&
    h.description.trim().length >= MIN_HOBBY_NAME_LENGTH &&
    h.description.length <= DESC_MAX
  )

  // Load from API on mount, fallback to localStorage
  useEffect(() => {
    api.get('/hobbies')
      .then(res => {
        const apiHobbies = res.data.map(h => ({
          id: h.id,
          name: h.name,
          description: h.description || '',
        }))
        if (apiHobbies.length > 0) {
          setHobbies(apiHobbies)
          saveToStorage(apiHobbies)
        } else {
          setHobbies(loadHobbies())
        }
      })
      .catch(() => {
        setHobbies(loadHobbies())
      })
      .finally(() => {
        saveRef.current = true
      })
  }, [])

  useEffect(() => {
    const autoSave = async () => {
      if (hobbies.length === 0) return
      const payload = hobbies.map(({ name, description }) => ({ name, description }))
      try {
        await api.put('/hobbies', { hobbies: payload })
        saveToStorage(hobbies)
      } catch {}
    }
    window.addEventListener('beforeSessionTimeout', autoSave)
    return () => window.removeEventListener('beforeSessionTimeout', autoSave)
  }, [hobbies])

  const handleSave = async () => {
    if (!canSave || saveStatus === 'saving') return
    setSaveStatus('saving')
    try {
      const payload = hobbies.map(({ name, description }) => ({ name, description }))
      await api.put('/hobbies', { hobbies: payload })
      saveToStorage(hobbies)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }

  const addHobby = () => {
    if (hobbies.length >= MAX_HOBBIES) return
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
      {hobbies.length === 0 ? (
        <EmptyState />
      ) : (
        hobbies.map(hobby => (
          <HobbyEntry
            key={hobby.id}
            hobby={hobby}
            onRemove={() => removeHobby(hobby.id)}
            onChange={updated => updateHobby(hobby.id, updated)}
          />
        ))
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={addHobby}
          disabled={hobbies.length >= MAX_HOBBIES}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Pridėti hobį {hobbies.length > 0 && `(${hobbies.length}/${MAX_HOBBIES})`}
        </button>

        <button
          onClick={handleSave}
          disabled={!canSave || saveStatus === 'saving'}
          className="flex items-center justify-center gap-1.5 px-12 py-3 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap border-slate-700 bg-slate-700 text-white hover:bg-slate-800 hover:border-slate-800"
        >
          {saveStatus === 'saving' && (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saugoma...
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Išsaugota
            </>
          )}
          {saveStatus === 'error' && 'Nepavyko išsaugoti'}
          {saveStatus === 'idle' && 'Išsaugoti'}
        </button>
      </div>
    </div>
  )
}
