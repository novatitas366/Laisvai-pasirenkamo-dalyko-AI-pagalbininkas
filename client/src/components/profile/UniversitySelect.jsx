import { useState, useRef, useEffect } from 'react'

const UNIVERSITIES = [
  'Vilniaus universitetas',
  'Kauno technologijos universitetas',
  'Vilniaus Gedimino technikos universitetas',
  'Vytauto Didžiojo universitetas',
  'Klaipėdos universitetas',
  'Mykolo Romerio universitetas',
  'Šiaulių universitetas',
  'Lietuvos sveikatos mokslų universitetas',
  'Lietuvos sporto universitetas',
]

export default function UniversitySelect({ value, onChange }) {
  const [input, setInput] = useState(value)
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => {
    setInput(value)
  }, [value])

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filtered = input
    ? UNIVERSITIES.filter((u) => u.toLowerCase().includes(input.toLowerCase()))
    : UNIVERSITIES

  const handleInput = (e) => {
    const val = e.target.value.replace(/[^a-zA-ZÀ-žĄąČčĘęĖėĮįŠšŲųŪūŽž\s]/g, '')
    if (val.length > 70) return
    setInput(val)
    setOpen(true)
    if (!val) onChange('')
  }

  const handleSelect = (uni) => {
    setInput(uni)
    onChange(uni)
    setOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
          />
        </svg>
        <input
          type="text"
          placeholder="Įveskite universitetą"
          value={input}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 placeholder:text-slate-400"
        />
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filtered.map((uni) => (
            <li
              key={uni}
              onClick={() => handleSelect(uni)}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                value === uni
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {uni}
            </li>
          ))}
        </ul>
      )}

      {open && input && filtered.length === 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-3">
          <p className="text-sm text-slate-400">Universitetas nerastas</p>
        </div>
      )}
    </div>
  )
}
