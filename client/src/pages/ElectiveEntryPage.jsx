import { useState } from 'react'

export default function ElectiveEntryPage() {
  const [entries, setEntries] = useState([
    { id: Date.now(), name: '', credits: '', description: '' }
  ])

  const addEntry = () => {
    setEntries([
      ...entries,
      { id: Date.now(), name: '', credits: '', description: '' }
    ])
  }

  const removeEntry = (id) => {
    if (entries.length === 1) return // Keep at least one form
    setEntries(entries.filter(entry => entry.id !== id))
  }

  const handleUpdate = (id, field, value) => {
    setEntries(entries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Validation and DB saving will be in SCRUM-18 and SCRUM-22
    console.log('Išsaugomi duomenys:', entries)
    alert(`Išsaugota ${entries.length} dalykai (simuliacija)`)
  }

  return (
    <div className="max-w-2xl pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Pridėti pasirenkamus dalykus</h1>
          <p className="text-sm text-slate-400">Įveskite informaciją apie jus dominančius dalykus</p>
        </div>
        <button
          onClick={addEntry}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 text-sm font-semibold rounded-xl hover:bg-brand-100 transition-colors border border-brand-200"
          title="Pridėti dar vieną dalyką"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Pridėti kitą
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {entries.map((entry, index) => (
          <div key={entry.id} className="relative bg-white p-6 border border-slate-200 rounded-2xl shadow-sm transition-all hover:border-slate-300">
            {entries.length > 1 && (
              <button
                onClick={() => removeEntry(entry.id)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
                title="Pašalinti"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Dalyko pavadinimas <span className="text-slate-300 ml-1">#{index + 1}</span>
                </label>
                <input
                  type="text"
                  value={entry.name}
                  onChange={(e) => handleUpdate(entry.id, 'name', e.target.value)}
                  placeholder="Pvz.: Dirbtinis intelektas"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Kreditai
                </label>
                <input
                  type="number"
                  value={entry.credits}
                  onChange={(e) => handleUpdate(entry.id, 'credits', e.target.value)}
                  placeholder="6"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400"
                />
              </div>

              <div className="md:col-span-4 space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  Aprašymas
                </label>
                <textarea
                  value={entry.description}
                  onChange={(e) => handleUpdate(entry.id, 'description', e.target.value)}
                  placeholder="Trumpai apibūdinkite dalyko temas, tikslus ar reikalavimus..."
                  rows="3"
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 flex items-center gap-4">
          <button
            type="submit"
            className="px-8 py-3 bg-brand-600 text-white text-sm font-bold rounded-xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 active:scale-95"
          >
            Išsaugoti visus
          </button>
          
          <button
            onClick={addEntry}
            type="button"
            className="md:hidden flex items-center gap-2 px-6 py-3 bg-white text-slate-700 text-sm font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Pridėti dar vieną
          </button>
        </div>
      </form>
    </div>
  )
}
