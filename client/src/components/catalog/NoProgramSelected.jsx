import { Link } from 'react-router-dom'

export default function NoProgramSelected() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
        <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 mb-1">Studijų programa nepasirinkta</p>
        <p className="text-xs text-slate-400">Pasirinkite studijų programą profilyje, kad matytumėte jos dalykus</p>
      </div>
      <Link
        to="/profilis"
        className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
      >
        Eiti į profilį
      </Link>
    </div>
  )
}
