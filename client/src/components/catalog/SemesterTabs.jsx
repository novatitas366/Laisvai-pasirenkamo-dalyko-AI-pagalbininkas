export default function SemesterTabs({ semesters, subjectsBySemester, activeTab, onSelect }) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 mb-4">
      {semesters.map((sem) => (
        <button
          key={sem}
          onClick={() => onSelect(sem)}
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
  )
}
