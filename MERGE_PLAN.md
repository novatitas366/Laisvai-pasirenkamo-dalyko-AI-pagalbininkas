# Merge Plan — SCRUM-55, SCRUM-56, SCRUM-57 into SCRUM-54

## The Core Problem

Git merges use **three-way diff**: `base → branch A` and `base → branch B`.
If both SCRUM-55 and SCRUM-57 branch from the same empty `RegisterPage.jsx` in SCRUM-54
and both write content to it, Git **always** conflicts — regardless of merge order.
The fix is a branching strategy change, not a file-content trick.

---

## Required Branching Strategy

```
SCRUM-54 (Develop)
├── SCRUM-55  (branches from SCRUM-54)
│   └── SCRUM-57  ← must branch from SCRUM-55, NOT from SCRUM-54
└── SCRUM-56  (branches from SCRUM-54)
```

**Merge order into SCRUM-54:**
1. SCRUM-55 first
2. SCRUM-56 (no client overlap — can be done in any order relative to SCRUM-55)
3. SCRUM-57 last — by then SCRUM-54 already has SCRUM-55's `RegisterPage.jsx`, so SCRUM-57's diff applies cleanly

---

## File Ownership

| File | SCRUM-55 | SCRUM-56 | SCRUM-57 |
|---|---|---|---|
| `client/src/App.jsx` | ✅ owns | ❌ do not touch | ❌ do not touch |
| `client/src/pages/RegisterPage.jsx` | ✅ UI only | ❌ do not touch | ✅ adds validation + API |
| `client/src/pages/LoginPage.jsx` | ✅ placeholder | ❌ do not touch | ❌ do not touch |
| `server/package.json` | ❌ do not touch | ✅ owns | ❌ do not touch |
| `server/src/server.js` | ❌ do not touch | ✅ owns | ❌ do not touch |
| `server/src/app.js` | ❌ do not touch | ✅ owns | ❌ do not touch |
| `server/src/config/database.js` | ❌ do not touch | ✅ owns | ❌ do not touch |
| `server/src/routes/index.js` | ❌ do not touch | ✅ owns | ❌ do not touch |
| `server/src/modules/auth/*` | ❌ do not touch | ✅ owns | ❌ do not touch |

---

## SCRUM-55 — Exact File Contents

### `client/src/App.jsx`
```jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import RecommendationsPage from './pages/RecommendationsPage'
import ProfilePage from './pages/ProfilePage'
import DocumentUploadPage from './pages/DocumentUploadPage'
import HistoryPage from './pages/HistoryPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/rekomendacijos" replace />} />
        <Route path="rekomendacijos" element={<RecommendationsPage />} />
        <Route path="profilis" element={<ProfilePage />} />
        <Route path="dokumentai" element={<DocumentUploadPage />} />
        <Route path="istorija" element={<HistoryPage />} />
      </Route>
    </Routes>
  )
}
```

### `client/src/pages/LoginPage.jsx`
```jsx
// Login page - form, redirect
export default function LoginPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Prisijungimas</h1>
      <p className="text-sm text-slate-400">Prisijunkite prie paskyros</p>
    </div>
  )
}
```

### `client/src/pages/RegisterPage.jsx` — UI only, no validation, no API call
```jsx
// Register page - form UI
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
          <span className="font-semibold text-brand-600 text-lg leading-tight">DalykoPagalbininkas</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">Sukurkite paskyrą</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">El. paštas</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Slaptažodis</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8-12 simbolių"
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Pakartokite slaptažodį</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="mt-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Registruotis
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-400 text-center">
          Jau turite paskyrą?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">Prisijungti</Link>
        </p>
      </div>
    </div>
  )
}
```

---

## SCRUM-56 — File Ownership

Touches **only** server files. Zero client files.

- `server/package.json`
- `server/src/server.js`
- `server/src/app.js`
- `server/src/config/database.js`
- `server/src/routes/index.js`
- `server/src/modules/auth/auth.routes.js`
- `server/src/modules/auth/auth.controller.js`
- `server/src/modules/auth/auth.service.js`

Current server file contents (as of resolved merge) are the correct final versions for this branch.

---

## SCRUM-57 — Exact File Contents

**Must branch from SCRUM-55's tip, not from SCRUM-54.**
Touches only one file:

### `client/src/pages/RegisterPage.jsx` — full validation + API call

This is the current file content in the repo (already the correct final version).
Key additions over SCRUM-55's version:
- `PASSWORD_REQUIREMENTS` array with 5 rules
- `validateEmail()` and `validatePassword()` helper functions
- `useNavigate` for redirect on success
- `errors`, `serverError`, `loading` state
- `handleSubmit` with full validation + `fetch` to `POST /api/auth/register`
- Inline error messages under each field
- Password requirements tooltip on focus
- Loading state on submit button

---

## Git Commands to Fix Current Branches

```bash
# Step 1 — fix SCRUM-55: ensure it has only UI version of RegisterPage.jsx
git checkout SCRUM-55
# Update RegisterPage.jsx to UI-only content (see above)
# Verify no server files are modified on this branch

# Step 2 — rebase SCRUM-57 onto SCRUM-55
git checkout SCRUM-57
git rebase SCRUM-55
# SCRUM-57's RegisterPage.jsx diff now applies on top of SCRUM-55's UI version

# Step 3 — merge into Develop in order
git checkout Develop
git merge SCRUM-55   # adds App.jsx, RegisterPage.jsx (UI), LoginPage.jsx
git merge SCRUM-56   # adds server files — zero client overlap, no conflict
git merge SCRUM-57   # modifies RegisterPage.jsx — base matches, applies cleanly
```
