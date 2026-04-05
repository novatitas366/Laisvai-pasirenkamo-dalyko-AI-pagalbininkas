import HobbiesForm from '../components/forms/HobbiesForm'

export default function HobbiesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Hobiai</h1>
      <p className="text-sm text-slate-400 mb-4">Pridėkite savo hobius ir pomėgius</p>
      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-6 flex gap-3">
        <svg className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs text-brand-700">
          Hobiai padeda DI asistentui geriau suprasti jūsų interesus ir rekomenduoti tinkamiausius pasirenkamus dalykus. Kuo išsamiau aprašysite — tuo tikslesnės rekomendacijos.
        </p>
      </div>
      <HobbiesForm />
    </div>
  )
}
