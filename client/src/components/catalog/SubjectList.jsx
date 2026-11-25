import { filterSubjects } from '../../utils/subjects'

export default function SubjectList({ subjects, searchQuery }) {
  const filtered = filterSubjects(subjects, searchQuery)
  const emptyText = searchQuery.trim() ? `Pagal „${searchQuery}" nieko nerasta` : 'Dalykų nerasta'

  return (
    <ul className="space-y-2">
      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">{emptyText}</p>
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
}
