export function ProfileToggle({ isEmpty, open, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
    >
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${isEmpty ? 'bg-amber-400' : 'bg-green-400'}`}
      />
      <span className="hidden sm:inline">{isEmpty ? 'Profilis neužpildytas' : 'Profilis aktyvus'}</span>
      <svg
        className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export function ProfileDetails({ profile, hasValidHobbies, isEmpty }) {
  return (
    <div className="bg-slate-50 border-b border-slate-100 p-4 text-xs text-slate-500 space-y-0.5 animate-in slide-in-from-top-1">
      {profile.university && <p><span className="text-slate-400">Universitetas:</span> {profile.university}</p>}
      {profile.studyProgram && <p><span className="text-slate-400">Studijų programa:</span> {profile.studyProgram}</p>}
      {hasValidHobbies && <p><span className="text-slate-400">Hobiai:</span> {profile.hobbies.map(h => h.name).join(', ')}</p>}
      {!hasValidHobbies && (
        <p className="text-amber-500">
          Hobių informacija nepakankama — pridėkite bent 1 hobį <a href="/profilis" className="underline font-bold">profilyje</a> geresnėms rekomendacijoms.
        </p>
      )}
      {isEmpty && (
        <p className="text-amber-500">
          Eikite į <a href="/profilis" className="underline font-bold">Mano profilį</a> ir užpildykite informaciją.
        </p>
      )}
    </div>
  )
}
