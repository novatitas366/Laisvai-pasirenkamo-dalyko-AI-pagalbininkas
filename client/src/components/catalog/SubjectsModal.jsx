import { useState, useEffect } from 'react'
import api from '../../services/api'

export default function SubjectsModal({ program, open, onClose }) {
  const [subjectsBySemester, setSubjectsBySemester] = useState({})
  const [activeTab, setActiveTab] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!open || !program) return

    setLoading(true)
    setError(null)
    setSubjectsBySemester({})
    setActiveTab(null)
    setSearchQuery('')

    api.get(`/study-programs/${program.id}/subjects`)
      .then(({ data }) => {
        const grouped = {}
        data.forEach((subject) => {
          if (!grouped[subject.semester]) grouped[subject.semester] = []
          grouped[subject.semester].push(subject)
        })
        setSubjectsBySemester(grouped)
        const first = Object.keys(grouped).sort((a, b) => Number(a) - Number(b))[0]
        setActiveTab(first ?? null)
      })
      .catch(() => setError('Nepavyko užkrauti dalykų'))
      .finally(() => setLoading(false))
  }, [program?.id, open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !program) return null

  const semesters = Object.keys(subjectsBySemester).sort((a, b) => Number(a) - Number(b))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{program.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Studijų programos dalykai</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!loading && !error && semesters.length > 0 && (
          <div className="flex flex-col gap-3 px-6 pt-4 pb-2 flex-shrink-0 border-b border-slate-100">
            <div className="flex gap-1 overflow-x-auto">
              {semesters.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setActiveTab(sem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTab === sem
                      ? 'bg-brand-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {sem} semestras ({subjectsBySemester[sem].length})
                </button>
              ))}
            </div>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Ieškoti dalyko pagal pavadinimą arba kodą..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="text-sm">Kraunama...</span>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500 text-center py-10">{error}</p>
          )}

          {!loading && !error && semesters.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-10">Dalykų nerasta</p>
          )}

          {!loading && !error && activeTab && subjectsBySemester[activeTab] && (() => {
            const q = searchQuery.trim().toLowerCase()
            const filtered = q
              ? subjectsBySemester[activeTab].filter(
                  (s) =>
                    s.name.toLowerCase().includes(q) ||
                    (s.code && s.code.toLowerCase().includes(q))
                )
              : subjectsBySemester[activeTab]
            return (
            <ul className="space-y-2">
              {filtered.length === 0 ? (
                <p className="text-sm text-slate-400 py-6 text-center">
                  {q ? `Pagal „${searchQuery}" nieko nerasta` : 'Dalykų nerasta'}
                </p>
              ) : (
              filtered.map((subject) => (
                <li
                  key={subject.id}
                  className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800">{subject.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{subject.code}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-1 rounded-full flex-shrink-0 ml-4">
                    {subject.credits} kr.
                  </span>
                </li>
              ))
              )}
            </ul>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
