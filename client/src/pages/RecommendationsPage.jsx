import { useState } from 'react'
import ChatWindow from '../components/chat/ChatWindow'
import RecommendationResult from '../components/recommendations/RecommendationResult'
import SubjectCheckboxList from '../components/subjects/SubjectCheckboxList'
import dominantSubjects from '../data/dominantSubjects'
import api from '../services/api'

// TODO: replace with real API response from SCRUM-70 once AI integration is complete
const mockRecommendation = {
  recommendedSubject: 'Dirbtinis intelektas',
  explanation: 'Šis dalykas rekomenduojamas, nes atitinka jūsų pomėgius technologijoms, duomenų analizei ir programavimui.',
}

export default function RecommendationsPage() {
  const [selectedIds, setSelectedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
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
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Rekomendacijos</h1>
      <p className="text-sm text-slate-400 mb-6">Gauti AI pasiūlymus pasirenkimiems dalykams</p>

      <div className="max-w-xl mb-6">
        <RecommendationResult recommendation={mockRecommendation} />
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Dominantys studijų dalykai</h2>
        <p className="text-sm text-slate-400 mb-4">
          Pažymėkite dalykus, kurie bus naudojami kaip papildomas kontekstas generuojant rekomendacijas.
        </p>

        <SubjectCheckboxList
          subjects={dominantSubjects}
          selectedIds={selectedIds}
          onToggle={handleToggle}
        />
      </div>

      {submitError && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 mb-4">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 mb-4">
          Dominantys dalykai sėkmingai pateikti.
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={selectedIds.length === 0 || submitting}
        className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed mb-6"
      >
        {submitting ? 'Pateikiama...' : 'Pateikti dominančius studijų dalykus'}
      </button>

      <ChatWindow />
    </div>
  )
}
