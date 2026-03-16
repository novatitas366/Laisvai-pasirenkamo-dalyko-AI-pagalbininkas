export default function SubjectCheckboxItem({ subject, checked, onChange }) {
  return (
    <label
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
        checked
          ? 'border-brand-400 bg-brand-50 text-brand-800'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onChange(subject.id)}
        className="accent-brand-600 w-4 h-4 flex-shrink-0"
      />
      <span className="text-sm font-medium">{subject.name}</span>
    </label>
  )
}
