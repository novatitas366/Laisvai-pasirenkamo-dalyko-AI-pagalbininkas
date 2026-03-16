import HobbiesForm from '../components/forms/HobbiesForm'

export default function HobbiesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Hobiai</h1>
      <p className="text-sm text-slate-400 mb-6">Pridėkite savo hobius ir pomėgius</p>
      <HobbiesForm />
    </div>
  )
}
