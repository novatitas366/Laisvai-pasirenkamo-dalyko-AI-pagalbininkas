import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import api from '../../services/api'

const NAV = [
  {
    section: 'Pagrindinis',
    links: [
      {
        to: '/rekomendacijos',
        label: 'Rekomendacijos',
        icon: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z',
      },
      {
        to: '/dalykai',
        label: 'Dalykų katalogas',
        icon: 'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
      },
      {
        to: '/pasirenkami-dalykai',
        label: 'Pridėti dalyką',
        icon: 'M12 4.5v15m7.5-7.5h-15',
      },
      {
        to: '/istorija',
        label: 'Istorija',
        icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
      },
    ],
  },
  {
    section: 'Profilis',
    links: [
      {
        to: '/profilis',
        label: 'Mano profilis',
        icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
      },
      {
        to: '/dokumentai',
        label: 'Dokumentai',
        icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
      },
    ],
  },
]

export default function Sidebar() {
  const [conversations, setConversations] = useState([])
  const location = useLocation()

  useEffect(() => {
    // Load conversations from API
    api.get('/conversations')
      .then(res => setConversations(res.data))
      .catch(err => console.error('Failed to fetch conversations', err))

    // Listen for title updates from ChatWindow
    const handleRename = (e) => {
      const { id, title } = e.detail
      setConversations(prev => prev.map(c => 
        c.id === id ? { ...c, title: title.substring(0, 100) } : c
      ))
    }

    window.addEventListener('conversation-renamed', handleRename)
    return () => window.removeEventListener('conversation-renamed', handleRename)
  }, [])

  return (
    <aside className="fixed left-0 top-16 bottom-0 w-56 bg-white border-r border-slate-200 flex flex-col py-4 px-3 z-30">
      <div className="mb-6 px-3">
        <Link
          to="/rekomendacijos"
          className="flex items-center justify-center gap-2 w-full py-2 bg-brand-600 text-white text-xs font-bold rounded-xl hover:bg-brand-700 transition-all shadow-md active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nauja rekomendacija
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {NAV.map(({ section, links }) => (
          <div key={section} className="mb-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
              {section}
            </p>
            {links.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/rekomendacijos'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                </svg>
                {label}
              </NavLink>
            ))}
          </div>
        ))}

        {conversations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 px-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pokalbių istorija
            </p>
            <div className="space-y-1">
              {conversations.map((chat) => (
                <NavLink
                  key={chat.id}
                  to={`/rekomendacijos/${chat.id}`}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`
                  }
                >
                  <p className="truncate max-w-full" title={chat.title}>{chat.title}</p>
                  <p className="text-[10px] text-slate-400 font-normal">{chat.date}</p>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
