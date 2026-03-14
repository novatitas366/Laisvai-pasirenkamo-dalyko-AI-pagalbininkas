import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const STORAGE_KEY = 'profile_study_program'

export default function SubjectsCatalogPage() {
  const [programs, setPrograms] = useState([])
  const [programsLoading, setProgramsLoading] = useState(true)
  const [programsError, setProgramsError] = useState(null)

  const [subjectsBySemester, setSubjectsBySemester] = useState({})
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError, setSubjectsError] = useState(null)
  const [activeTab, setActiveTab] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const storedName = localStorage.getItem(STORAGE_KEY) ?? ''

  useEffect(() => {
    api.get('/study-programs')
      .then(({ data }) => setPrograms(data))
      .catch(() => setProgramsError('Nepavyko užkrauti studijų programų'))
      .finally(() => setProgramsLoading(false))
  }, [])

  const selectedProgram = programs.find((p) => p.name === storedName) ?? null

  useEffect(() => {
    if (!selectedProgram) return

    setSubjectsLoading(true)
    setSubjectsError(null)
    setSubjectsBySemester({})
    setActiveTab(null)

    api.get(`/study-programs/${selectedProgram.id}/subjects`)
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
      .catch(() => setSubjectsError('Nepavyko užkrauti dalykų'))
      .finally(() => setSubjectsLoading(false))
  }, [selectedProgram?.id])

  const semesters = Object.keys(subjectsBySemester).sort((a, b) => Number(a) - Number(b))

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dalykų katalogas</h1>
      <p className="text-sm text-slate-400 mb-8">Jūsų studijų programos dalykai</p>

      {programsLoading && (
        <div className="flex items-center gap-3 text-slate-400 py-12">
          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <span className="text-sm">Kraunama...</span>
        </div>
      )}

      {programsError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {programsError}
        </div>
      )}

      {!programsLoading && !programsError && !selectedProgram && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700 mb-1">Studijų programa nepasirinkta</p>
            <p className="text-xs text-slate-400">Pasirinkite studijų programą profilyje, kad matytumėte jos dalykus</p>
          </div>
          <Link
            to="/profilis"
            className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
          >
            Eiti į profilį
          </Link>
        </div>
      )}

      {!programsLoading && !programsError && selectedProgram && (
        <>
          <div className="flex items-center justify-between px-5 py-4 bg-white border border-brand-200 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedProgram.name}</p>
                <p className="text-xs text-slate-400">{selectedProgram.code}</p>
              </div>
            </div>
            <Link
              to="/profilis"
              className="text-xs text-slate-400 hover:text-brand-600 transition-colors"
            >
              Keisti programą
            </Link>
          </div>

          {subjectsLoading && (
            <div className="flex items-center gap-3 text-slate-400 py-8">
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span className="text-sm">Kraunami dalykai...</span>
            </div>
          )}

          {subjectsError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
              {subjectsError}
            </div>
          )}

          {!subjectsLoading && !subjectsError && semesters.length > 0 && (
            <>
              <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
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

              <div className="mb-4">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Ieškoti dalyko pagal pavadinimą arba kodą..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400"
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

              {activeTab && subjectsBySemester[activeTab] && (() => {
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
                      className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl"
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
            </>
          )}
        </>
      )}
    </div>
  )
}
