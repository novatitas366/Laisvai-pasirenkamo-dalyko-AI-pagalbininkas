import { useState, useEffect } from 'react'
import UniversitySelect from '../components/profile/UniversitySelect'
import StudyProgramSelect from '../components/profile/StudyProgramSelect'
import SubjectsModal from '../components/catalog/SubjectsModal'
import api from '../services/api'

const STORAGE_KEY = 'profile_study_program'
const UNI_STORAGE_KEY = 'profile_university'

export default function ProfilePage() {
  const [university, setUniversity] = useState('')
  const [studyProgram, setStudyProgram] = useState('')
  const [saved, setSaved] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [allPrograms, setAllPrograms] = useState([])

  useEffect(() => {
    api.get('/study-programs').then(({ data }) => setAllPrograms(data)).catch(() => {})
  }, [])

  useEffect(() => {
    api.get('/profile')
      .then(({ data }) => {
        if (data?.university_name) {
          setUniversity(data.university_name)
          localStorage.setItem(UNI_STORAGE_KEY, data.university_name)
        }
        if (data?.study_program_name) {
          setStudyProgram(data.study_program_name)
          localStorage.setItem(STORAGE_KEY, data.study_program_name)
        }
      })
      .catch(() => {
        const storedUni = localStorage.getItem(UNI_STORAGE_KEY)
        if (storedUni) setUniversity(storedUni)
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) setStudyProgram(stored)
      })
  }, [])

  useEffect(() => {
    const autoSave = () => {
      if (university.trim() && studyProgram.trim()) {
        localStorage.setItem(UNI_STORAGE_KEY, university)
        localStorage.setItem(STORAGE_KEY, studyProgram)
      }
    }
    window.addEventListener('beforeSessionTimeout', autoSave)
    return () => window.removeEventListener('beforeSessionTimeout', autoSave)
  }, [university, studyProgram])

  const programs = allPrograms.filter((p) => p.university_name === university)

  const handleUniversityChange = (uni) => {
    setUniversity(uni)
    if (uni !== university) {
      setStudyProgram('')
    }
  }

  const handleSave = async () => {
    const selectedProgramObj = allPrograms.find(
      (p) => p.name === studyProgram && p.university_name === university
    )
    const universityId = selectedProgramObj?.university_id || null
    const studyProgramId = selectedProgramObj?.id || null

    localStorage.setItem(UNI_STORAGE_KEY, university)
    localStorage.setItem(STORAGE_KEY, studyProgram)

    try {
      await api.put('/profile', { universityId, studyProgramId })
    } catch {
      // localStorage jau atnaujintas, tęsiame
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const selectedProgram = programs.find((p) => p.name === studyProgram)

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mano profilis</h1>
      <p className="text-sm text-slate-400 mb-8">Studijų programa, išklausyti dalykai, hobiai</p>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Universitetas</h2>
        <UniversitySelect value={university} onChange={handleUniversityChange} />
      </div>

      {university && (
        <div className="mb-6 fade-in">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Studijų programa</h2>

          <StudyProgramSelect
            programs={programs}
            value={studyProgram}
            onChange={setStudyProgram}
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={!university.trim() || !studyProgram.trim()}
          className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saved ? 'Išsaugota' : 'Išsaugoti'}
        </button>

        {selectedProgram && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-brand-600 border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Peržiūrėti dalykus
          </button>
        )}
      </div>

      <SubjectsModal
        program={selectedProgram ?? null}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  )
}
