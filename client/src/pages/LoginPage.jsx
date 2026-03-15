import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Authorization logic will be implemented in future tasks
    console.log('Prisijungimo duomenys:', formData)
    alert('Bandoma prisijungti (simuliacija)')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">Dalyko Pagalbininkas</h1>
          <p className="text-xs text-brand-600 font-medium uppercase tracking-wider">AI Studijų Asistentas</p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 md:p-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sveiki sugrįžę!</h2>
        <p className="text-sm text-slate-400 mb-8">Prisijunkite prie savo paskyros</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-700 block ml-1">
              El. pašto adresas
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="vardenis.pavardenis@stud.vdu.lt"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Slaptažodis
              </label>
              <a href="#" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                Pamiršote?
              </a>
            </div>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-brand-600 text-white font-bold rounded-2xl hover:bg-brand-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-4"
          >
            Prisijungti
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Neturite paskyros?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
              Registruotis
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-6">
        <Link to="/rekomendacijos" className="text-xs font-medium text-slate-400 hover:text-slate-600">
          Grįžti į pradinį
        </Link>
        <span className="text-slate-200">|</span>
        <a href="#" className="text-xs font-medium text-slate-400 hover:text-slate-600">
          Privatumo politika
        </a>
      </div>
    </div>
  )
}
