import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import useSessionTimeout from '../../hooks/useSessionTimeout'

export default function MainLayout() {
  const { showWarning, resetTimer, logout } = useSessionTimeout()

  return (
    <>
      <Header />
      <div className="flex pt-16 min-h-screen">
        <Sidebar />
        <main className="ml-56 flex-1 p-6 min-w-0">
          <Outlet />
        </main>
      </div>

      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900">Sesija baigiasi</h2>
            </div>
            <p className="text-sm text-slate-500 mb-6">
              Dėl neaktyvumo po <span className="font-semibold text-slate-700">1 minutės</span> būsite automatiškai atjungtas. Jūsų neišsaugoti duomenys bus išsaugoti automatiškai. Norėdami tęsti – spauskite „Tęsti".
            </p>
            <div className="flex gap-3">
              <button
                onClick={logout}
                className="flex-1 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors"
              >
                Atsijungti
              </button>
              <button
                onClick={resetTimer}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-2xl hover:bg-brand-700 transition-colors"
              >
                Tęsti
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
