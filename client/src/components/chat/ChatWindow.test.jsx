import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ChatWindow from './ChatWindow'
import api from '../../services/api'
import useProfile from '../../hooks/useProfile'

jest.mock('../../services/api')
jest.mock('../../hooks/useProfile')

const SESSION_KEY = 'chat_new_messages'

const FILLED_PROFILE = {
  profile: { university: 'VU', studyProgram: 'Informatika', hobbies: [{ name: 'Šachmatai' }] },
  isEmpty: false,
  hasValidHobbies: true,
  buildSystemPrompt: () => 'system-prompt',
}

function renderChat(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<ChatWindow />} />
        <Route path="/pokalbis/:id" element={<ChatWindow />} />
      </Routes>
    </MemoryRouter>
  )
}

function mockConversationApi({ messages = [], conversations = [] } = {}) {
  api.get.mockImplementation((url) => {
    if (url === '/conversations') return Promise.resolve({ data: conversations })
    return Promise.resolve({ data: messages })
  })
}

function typeAndSend(text) {
  const input = screen.getByPlaceholderText('Užduokite klausimą apie pasirenkamus dalykus...')
  fireEvent.change(input, { target: { value: text } })
  fireEvent.click(screen.getByTitle('Siųsti'))
}

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

beforeEach(() => {
  jest.clearAllMocks()
  sessionStorage.clear()
  useProfile.mockReturnValue(FILLED_PROFILE)
  api.get.mockResolvedValue({ data: [] })
})

// ── Naujas pokalbis ───────────────────────────────────────────────────────────

describe('ChatWindow: naujas pokalbis', () => {
  test('rodomas pavadinimas „Nauja rekomendacija“ ir tuščio pokalbio užrašas', () => {
    renderChat()

    expect(screen.getByText('Nauja rekomendacija')).toBeInTheDocument()
    expect(screen.getByText('Užduokite klausimą')).toBeInTheDocument()
  })

  test('nekreipiamasi į API, kai nėra pokalbio ID', () => {
    renderChat()

    expect(api.get).not.toHaveBeenCalled()
  })

  test('žinutės atkuriamos iš sessionStorage', () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([{ id: 1, role: 'user', text: 'Išsaugota žinutė' }]))

    renderChat()

    expect(screen.getByText('Išsaugota žinutė')).toBeInTheDocument()
  })

  test('sugadinti sessionStorage duomenys ignoruojami', () => {
    sessionStorage.setItem(SESSION_KEY, '{netinkamas json')

    renderChat()

    expect(screen.getByText('Užduokite klausimą')).toBeInTheDocument()
  })

  test('išsiųsta žinutė ir atsakymas rodomi ir išsaugomi sessionStorage', async () => {
    api.post.mockResolvedValue({ data: { text: 'AI atsakymas' } })
    renderChat()

    typeAndSend('Labas')

    expect(await screen.findByText('AI atsakymas')).toBeInTheDocument()
    expect(screen.getByText('Labas')).toBeInTheDocument()
    expect(api.post).toHaveBeenCalledWith('/chat', {
      systemPrompt: 'system-prompt',
      messages: [{ role: 'user', content: 'Labas' }],
    })
    const saved = JSON.parse(sessionStorage.getItem(SESSION_KEY))
    expect(saved.map((m) => m.text)).toEqual(['Labas', 'AI atsakymas'])
  })

  test('nepavykus gauti atsakymo rodomas klaidos pranešimas', async () => {
    api.post.mockRejectedValue(new Error('Network error'))
    renderChat()

    typeAndSend('Labas')

    expect(await screen.findByText('Atsiprašome, įvyko klaida. Bandykite dar kartą.')).toBeInTheDocument()
  })
})

// ── Esamas pokalbis ───────────────────────────────────────────────────────────

describe('ChatWindow: esamas pokalbis', () => {
  test('įkeliama pokalbio istorija ir pavadinimas', async () => {
    mockConversationApi({
      messages: [{ id: 10, role: 'assistant', content: 'Ankstesnis atsakymas' }],
      conversations: [{ id: 5, title: 'Mano pokalbis' }],
    })

    renderChat('/pokalbis/5')

    expect(await screen.findByText('Ankstesnis atsakymas')).toBeInTheDocument()
    expect(await screen.findByText('Mano pokalbis')).toBeInTheDocument()
    expect(api.get).toHaveBeenCalledWith('/conversations/5')
    expect(api.get).toHaveBeenCalledWith('/conversations')
  })

  test('kai pokalbio sąraše nėra, rodomas „Bevardis pokalbis“', async () => {
    mockConversationApi({ conversations: [{ id: 99, title: 'Kitas' }] })

    renderChat('/pokalbis/5')

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2))
    expect(screen.getByText('Bevardis pokalbis')).toBeInTheDocument()
  })

  test('nepavykus įkelti istorijos klaida registruojama konsolėje', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    api.get.mockImplementation((url) =>
      url === '/conversations' ? Promise.resolve({ data: [] }) : Promise.reject(new Error('fail'))
    )

    renderChat('/pokalbis/5')

    await waitFor(() => expect(consoleError).toHaveBeenCalledWith('Failed to load messages', expect.any(Error)))
    consoleError.mockRestore()
  })

  test('esamo pokalbio žinutės nesaugomos sessionStorage', async () => {
    mockConversationApi({ messages: [{ id: 10, role: 'user', content: 'Sena žinutė' }] })

    renderChat('/pokalbis/5')

    await screen.findByText('Sena žinutė')
    expect(sessionStorage.getItem(SESSION_KEY)).toBeNull()
  })

  test('pervadinimas siunčia PATCH, apkarpo iki 100 simbolių ir praneša šoninei juostai', async () => {
    mockConversationApi({ conversations: [{ id: 5, title: 'Senas' }] })
    const listener = jest.fn()
    window.addEventListener('conversation-renamed', listener)
    renderChat('/pokalbis/5')

    fireEvent.click(await screen.findByText('Senas'))
    const input = screen.getByDisplayValue('Senas')
    fireEvent.change(input, { target: { value: '  Naujas pavadinimas  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() =>
      expect(api.patch).toHaveBeenCalledWith('/conversations/5/rename', { title: 'Naujas pavadinimas' })
    )
    await waitFor(() => expect(listener).toHaveBeenCalled())
    expect(listener.mock.calls[0][0].detail).toEqual({ id: '5', title: 'Naujas pavadinimas' })
    expect(screen.queryByDisplayValue('  Naujas pavadinimas  ')).not.toBeInTheDocument()
    window.removeEventListener('conversation-renamed', listener)
  })

  test('tuščias pavadinimas neišsiunčiamas', async () => {
    mockConversationApi({ conversations: [{ id: 5, title: 'Senas' }] })
    renderChat('/pokalbis/5')

    fireEvent.click(await screen.findByText('Senas'))
    const input = screen.getByDisplayValue('Senas')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(api.patch).not.toHaveBeenCalled()
  })

  test('naujo pokalbio pavadinimo redaguoti negalima', () => {
    renderChat()

    fireEvent.click(screen.getByText('Nauja rekomendacija'))

    expect(screen.queryByText(/\/100$/)).not.toBeInTheDocument()
  })
})

// ── Profilio informacija ──────────────────────────────────────────────────────

describe('ChatWindow: profilio informacija', () => {
  test('užpildytas profilis rodomas išskleidus', () => {
    renderChat()

    expect(screen.getByText('Profilis aktyvus')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Profilis aktyvus'))

    expect(screen.getByText('VU')).toBeInTheDocument()
    expect(screen.getByText('Informatika')).toBeInTheDocument()
    expect(screen.getByText('Šachmatai')).toBeInTheDocument()
  })

  test('neužpildytas profilis rodo įspėjimus', () => {
    useProfile.mockReturnValue({
      profile: { university: '', studyProgram: '', hobbies: [] },
      isEmpty: true,
      hasValidHobbies: false,
      buildSystemPrompt: () => '',
    })
    renderChat()

    fireEvent.click(screen.getByText('Profilis neužpildytas'))

    expect(screen.getByText(/Hobių informacija nepakankama/)).toBeInTheDocument()
    expect(screen.getByText(/ir užpildykite informaciją/)).toBeInTheDocument()
  })
})
