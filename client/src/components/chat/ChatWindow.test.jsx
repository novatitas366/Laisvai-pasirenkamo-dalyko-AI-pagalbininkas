import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ChatWindow from './ChatWindow'
import useProfile from '../../hooks/useProfile'
import '@testing-library/jest-dom'

jest.mock('../../hooks/useProfile')
jest.mock('../../services/api')

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn()
})

const defaultProfile = {
  profile: { university: '', studyProgram: '', hobbies: [], dominantSubjects: [], documents: [] },
  isEmpty: true,
  hasValidHobbies: false,
  buildSystemPrompt: jest.fn(() => ''),
}

function renderChatWindow() {
  return render(
    <MemoryRouter>
      <ChatWindow />
    </MemoryRouter>
  )
}

describe('SCRUM-41: ChatWindow – hobių pranešimas', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useProfile.mockReturnValue(defaultProfile)
  })

  test('rodo hobių perspėjimą kai nėra validžių hobių ir profilis atidarytas', async () => {
    renderChatWindow()

    fireEvent.click(screen.getByText(/Profilis neužpildytas/i))

    await waitFor(() => {
      expect(screen.getByText(/Hobių informacija nepakankama/i)).toBeInTheDocument()
    })
  })

  test('nerodo hobių perspėjimo kai yra validžių hobių', async () => {
    useProfile.mockReturnValue({
      ...defaultProfile,
      profile: { ...defaultProfile.profile, hobbies: [{ name: 'kinas' }] },
      isEmpty: false,
      hasValidHobbies: true,
    })

    renderChatWindow()

    fireEvent.click(screen.getByText(/Profilis aktyvus/i))

    await waitFor(() => {
      expect(screen.queryByText(/Hobių informacija nepakankama/i)).not.toBeInTheDocument()
    })
  })

  test('rodo hobių perspėjimą net kai kiti profilio laukai užpildyti', async () => {
    useProfile.mockReturnValue({
      ...defaultProfile,
      profile: { ...defaultProfile.profile, university: 'Vilniaus universitetas', studyProgram: 'Informatika' },
      isEmpty: false,
      hasValidHobbies: false,
    })

    renderChatWindow()

    fireEvent.click(screen.getByText(/Profilis aktyvus/i))

    await waitFor(() => {
      expect(screen.getByText(/Hobių informacija nepakankama/i)).toBeInTheDocument()
    })
  })
})
