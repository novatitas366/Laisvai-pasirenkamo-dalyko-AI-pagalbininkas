import { useState, useEffect } from 'react'
import StudyProgramSelect from '../components/profile/StudyProgramSelect'

const STORAGE_KEY = 'profile_study_program'

export default function ProfilePage() {
  const [studyProgram, setStudyProgram] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setStudyProgram(stored)
  }, [])

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, studyProgram)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mano profilis</h1>
      <p className="text-sm text-slate-400 mb-8">Studijų programa, išklausyti dalykai, hobiai</p>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Studijų programa</h2>
        <StudyProgramSelect value={studyProgram} onChange={setStudyProgram} />
      </div>

      <button
        onClick={handleSave}
        disabled={!studyProgram.trim()}
        className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saved ? 'Išsaugota' : 'Išsaugoti'}
      </button>
    </div>
  )
}
