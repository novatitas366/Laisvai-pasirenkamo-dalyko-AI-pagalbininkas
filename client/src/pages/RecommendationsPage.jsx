import { useState } from 'react'
import SubjectCheckboxList from '../components/subjects/SubjectCheckboxList'
import dominantSubjects from '../data/dominantSubjects'

export default function RecommendationsPage() {
  const [selectedIds, setSelectedIds] = useState([])

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Rekomendacijos</h1>
      <p className="text-sm text-slate-400 mb-8">Gauti AI rekomendacijas pasirenkamiems dalykams</p>

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
    </div>
  )
}
