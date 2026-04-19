import { useState, useEffect } from 'react'

const PAGE_SIZE = 10

export default function StudyProgramSelect({ programs = [], value, onChange }) {
  const [page, setPage] = useState(0)

  // Reset to first page when program list changes (e.g. university switch)
  useEffect(() => {
    setPage(0)
  }, [programs])

  const totalPages = Math.ceil(programs.length / PAGE_SIZE)
  const visible = programs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {visible.map((program) => (
          <label
            key={program.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
              value === program.name
                ? 'border-brand-400 bg-brand-50 text-brand-800'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <input
              type="radio"
              name="study_program"
              value={program.name}
              checked={value === program.name}
              onChange={() => onChange(program.name)}
              className="accent-brand-600"
            />
            <span className="text-sm font-medium">{program.name}</span>
          </label>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Ankstesnis
          </button>

          <span className="text-xs text-slate-500">
            {page + 1} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-3 py-1.5 text-sm rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Kitas →
          </button>
        </div>
      )}
    </div>
  )
}
