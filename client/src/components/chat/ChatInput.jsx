import { useState, useRef } from 'react'

const MAX_LENGTH = 500

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef(null)

  const charsLeft = MAX_LENGTH - text.length

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSend = () => {
    if (!text.trim() && !image) return
    onSend({ text: text.trim(), image: imagePreview })
    setText('')
    removeImage()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-4">
      {imagePreview && (
        <div className="relative inline-block mb-3">
          <img
            src={imagePreview}
            alt="Peržiūra"
            className="max-h-24 rounded-lg border border-slate-200"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-5 h-5 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-slate-700 transition-colors"
          >
            &times;
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-2.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors disabled:opacity-40"
          title="Pridėti nuotrauką"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21zm16.5-13.5a1.125 1.125 0 11-2.25 0 1.125 1.125 0 012.25 0z" />
          </svg>
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        <div className="flex-1 relative">
          <textarea
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH) setText(e.target.value)
            }}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Užduokite klausimą apie pasirenkamus dalykus..."
            rows={1}
            className="w-full resize-none px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 placeholder:text-slate-400 disabled:opacity-40 pr-16"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = '42px'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <span className={`absolute right-3 bottom-2.5 text-xs ${charsLeft < 50 ? 'text-red-400' : 'text-slate-300'}`}>
            {charsLeft}
          </span>
        </div>

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !image)}
          className="flex-shrink-0 p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title="Siųsti"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
