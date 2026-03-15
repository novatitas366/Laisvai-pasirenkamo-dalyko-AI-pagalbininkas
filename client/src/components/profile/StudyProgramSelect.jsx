export default function StudyProgramSelect({ programs = [], value, onChange }) {
  const isCustom = value !== '' && !programs.some((p) => p.name === value)

  return (
    <div className="space-y-2">
      {programs.map((program) => (
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

      <label
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
          isCustom
            ? 'border-brand-400 bg-brand-50'
            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        <input
          type="radio"
          name="study_program"
          checked={isCustom}
          onChange={() => onChange('')}
          className="accent-brand-600 flex-shrink-0"
        />
        <span className="text-sm font-medium text-slate-700 flex-shrink-0">Kita:</span>
        <input
          type="text"
          placeholder="Įveskite programos pavadinimą..."
          value={isCustom ? value : ''}
          onFocus={() => { if (!isCustom) onChange('') }}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm bg-transparent border-0 focus:outline-none placeholder:text-slate-400"
        />
      </label>
    </div>
  )
}
