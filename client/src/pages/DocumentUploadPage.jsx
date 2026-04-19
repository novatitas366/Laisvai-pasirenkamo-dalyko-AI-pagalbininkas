import { useState, useRef, useEffect, useCallback } from 'react'
import api from '../services/api'

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt']
const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

function FileBadge({ name, size, onRemove }) {
  const kb = (size / 1024).toFixed(1)
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl">
      <div className="flex items-center gap-3 min-w-0">
        <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium text-slate-700 truncate">{name}</span>
        <span className="text-xs text-slate-400 flex-shrink-0">{kb} KB</span>
      </div>
      <button type="button" onClick={onRemove} className="ml-3 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function mimeLabel(mime) {
  if (mime === 'application/pdf') return 'PDF'
  if (mime === 'text/plain') return 'TXT'
  if (mime?.includes('wordprocessingml')) return 'DOCX'
  if (mime === 'application/msword') return 'DOC'
  return mime
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('lt-LT', {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  } catch {
    return '—'
  }
}

function ResultPanel({ result, title, onClose }) {
  const [tab, setTab] = useState('apzvalga')
  const kb = (result.sizeBytes / 1024).toFixed(1)
  const extractedLen = result.extractedLength ?? result.extractedText?.length ?? 0

  return (
    <div className="mt-6 border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 bg-green-50 border-b border-green-100">
        <div className="flex items-center gap-2 min-w-0">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-green-800 truncate">{title}</span>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex gap-1 px-5 pt-3 pb-0 border-b border-slate-100">
        {[
          { id: 'apzvalga', label: 'Apžvalga' },
          { id: 'tekstas', label: 'Ištrauktas tekstas' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-b-2 -mb-px ${
              tab === t.id
                ? 'text-brand-600 border-brand-600 bg-white'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="px-5 py-4">
        {tab === 'apzvalga' && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-slate-400 mb-0.5">Failo pavadinimas</dt>
              <dd className="font-medium text-slate-700 truncate">{result.originalName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 mb-0.5">Tipas</dt>
              <dd className="font-medium text-slate-700">{mimeLabel(result.mimeType)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 mb-0.5">Dydis</dt>
              <dd className="font-medium text-slate-700">{kb} KB</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-400 mb-0.5">Ištraukta simbolių</dt>
              <dd className="font-medium text-slate-700">{extractedLen.toLocaleString('lt-LT')}</dd>
            </div>
          </dl>
        )}

        {tab === 'tekstas' && (
          <div>
            {result.extractedText?.trim() ? (
              <pre className="whitespace-pre-wrap text-xs text-slate-600 bg-slate-50 rounded-xl p-4 max-h-80 overflow-y-auto leading-relaxed font-sans">
                {result.extractedText}
              </pre>
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">Tekstas neištrauktas</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function DocumentUploadPage() {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [resultTitle, setResultTitle] = useState('Failas sėkmingai apdorotas')
  const [error, setError] = useState(null)
  const [documents, setDocuments] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState(null)
  const [openingId, setOpeningId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const inputRef = useRef(null)

  const loadDocuments = useCallback(async () => {
    setListError(null)
    setListLoading(true)
    try {
      const { data } = await api.get('/documents')
      setDocuments(data.documents ?? [])
    } catch (err) {
      setListError(err.response?.data?.error || 'Nepavyko įkelti dokumentų sąrašo')
      setDocuments([])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  function validateFile(f) {
    if (!ALLOWED_MIMES.includes(f.type)) {
      return 'Netinkamas failo tipas. Leidžiami: PDF, DOCX, TXT'
    }
    if (f.size > 100 * 1024 * 1024) {
      return 'Failas per didelis. Maksimalus dydis: 100 MB'
    }
    return null
  }

  function pickFile(f) {
    const validationError = validateFile(f)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    setResult(null)
    setFile(f)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) pickFile(f)
  }

  function handleInputChange(e) {
    const f = e.target.files[0]
    if (f) pickFile(f)
    e.target.value = ''
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/documents/upload', formData)
      setResultTitle('Failas sėkmingai apdorotas')
      setResult(data)
      setFile(null)
      await loadDocuments()
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Įkėlimo klaida')
    } finally {
      setUploading(false)
    }
  }

  async function openDocument(id) {
    setOpeningId(id)
    setError(null)
    try {
      const { data } = await api.get(`/documents/${id}`)
      setResultTitle('Išsaugotas dokumentas')
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Nepavyko atidaryti dokumento')
    } finally {
      setOpeningId(null)
    }
  }

  async function handleDelete(id, e) {
    e.stopPropagation()
    setDeletingId(id)
    setError(null)
    try {
      await api.delete(`/documents/${id}`)
      if (result?.id === id) {
        setResult(null)
      }
      await loadDocuments()
    } catch (err) {
      setError(err.response?.data?.error || 'Nepavyko ištrinti dokumento')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dokumentai</h1>
      <p className="text-sm text-slate-400 mb-8">Įkelti studijų programos ir dalykų failus</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Naujas įkėlimas</h2>
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`relative flex flex-col items-center justify-center gap-3 px-6 py-12 border-2 border-dashed rounded-2xl cursor-pointer transition-colors select-none ${
              dragOver
                ? 'border-brand-500 bg-brand-50'
                : 'border-slate-300 bg-slate-50 hover:border-brand-400 hover:bg-brand-50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_EXTENSIONS.join(',')}
              className="hidden"
              onChange={handleInputChange}
            />
            <svg className={`w-10 h-10 transition-colors ${dragOver ? 'text-brand-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Vilkite failą čia arba <span className="text-brand-600">pasirinkite</span></p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, TXT · maks. 100 MB</p>
            </div>
          </div>

          {file && (
            <div className="mt-4">
              <FileBadge name={file.name} size={file.size} onRemove={() => setFile(null)} />
            </div>
          )}

          <div className="mt-6">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="px-6 py-2.5 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              {uploading ? 'Įkeliama...' : 'Įkelti failą'}
            </button>
          </div>
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Mano dokumentai</h2>
          {listLoading && (
            <p className="text-sm text-slate-400 py-8 text-center">Kraunama...</p>
          )}
          {!listLoading && listError && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
              {listError}
            </div>
          )}
          {!listLoading && !listError && documents.length === 0 && (
            <p className="text-sm text-slate-400 py-6 border border-dashed border-slate-200 rounded-2xl text-center px-4">
              Dar nėra įkeltų dokumentų
            </p>
          )}
          {!listLoading && !listError && documents.length > 0 && (
            <ul className="space-y-2">
              {documents.map((doc) => (
                <li key={doc.id}>
                  <div className="flex items-stretch gap-2 rounded-xl border border-slate-200 bg-white hover:border-brand-300 transition-colors overflow-hidden">
                    <button
                      type="button"
                      onClick={() => openDocument(doc.id)}
                      disabled={openingId === doc.id}
                      className="flex-1 min-w-0 text-left px-4 py-3 disabled:opacity-60"
                    >
                      <p className="text-sm font-medium text-slate-800 truncate">{doc.originalName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {mimeLabel(doc.mimeType)} · {(doc.sizeBytes / 1024).toFixed(1)} KB · {formatDate(doc.createdAt)}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(doc.id, e)}
                      disabled={deletingId === doc.id}
                      className="px-3 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Ištrinti"
                    >
                      {deletingId === doc.id ? (
                        <svg className="w-4 h-4 animate-spin mx-auto mt-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 mt-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-start gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {result && (
        <ResultPanel
          key={result.id}
          result={result}
          title={resultTitle}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
