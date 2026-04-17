import { useState } from 'react'
import dominantSubjects from '../data/dominantSubjects'
import api from '../services/api'

const categories = [...new Set(dominantSubjects.map(s => s.category))]

export default function DominantSubjectsPage() {
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleToggle = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    setSubmitSuccess(false)
    setSubmitting(true)
    try {
      await api.post('/user/dominant-subjects', { subjects: selectedIds })
      setSubmitSuccess(true)
    } catch {
      setSubmitError('Nepavyko pateikti duomenų. Bandykite dar kartą.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dominantys dalykai</h1>
      <p className="text-sm text-slate-400 mb-4">Pasirinkite studijų sritis, kurios jus domina</p>

      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-6 flex gap-3">
        <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-brand-700">
          Pažymėti dalykai padeda DI asistentui tiksliau rekomenduoti pasirenkamus dalykus pagal jūsų interesus.
        </p>
      </div>

      <div className="space-y-6 mb-6">
        {categories.map(category => {
          const subjects = dominantSubjects.filter(s => s.category === category)
          return (
            <div key={category}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{category}</p>
              <div className="space-y-1">
                {subjects.map(subject => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(subject.id)}
                      onChange={() => handleToggle(subject.id)}
                      className="w-4 h-4 accent-brand-600"
                    />
                    <span className="text-sm text-slate-700">{subject.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {submitError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4">
          Dominantys dalykai sėkmingai išsaugoti.
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={selectedIds.length === 0 || submitting}
        className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? 'Išsaugoma...' : 'Išsaugoti'}
      </button>
    </div>
  )
}
