import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from './Sidebar'
import api from '../../services/api'
import '@testing-library/jest-dom'

// Mock the API
jest.mock('../../services/api')

describe('SCRUM-77: Sidebar UI Component (Conversation History)', () => {
  const mockConversations = [
    { id: '1', title: 'Senas pokalbis', date: '2025-03-01' },
    { id: '2', title: 'Naujas pokalbis', date: '2025-03-10' }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    api.get.mockResolvedValue({ data: [] })
  })

  // Patikrinti sąrašo atvaizdavimą su duomenimis
  test('renders conversation list when data is available', async () => {
    api.get.mockResolvedValue({ data: mockConversations })
    
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Pokalbių istorija')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Senas pokalbis')).toBeInTheDocument()
    expect(screen.getByText('Naujas pokalbis')).toBeInTheDocument()
    expect(screen.getByText('2025-03-01')).toBeInTheDocument()
  })

  // Patikrinti sąrašo atvaizdavimą be duomenų (tuščia būsena)
  test('does not show history section when no data is available', async () => {
    api.get.mockResolvedValue({ data: [] })
    
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Pokalbių istorija')).not.toBeInTheDocument()
    })
  })

  // Patikrinti paspaudimo įvykius (onClick/NavLink) ant pokalbių elementų
  test('conversations are links to correct ID', async () => {
    api.get.mockResolvedValue({ data: mockConversations })
    
    render(
      <MemoryRouter initialEntries={['/rekomendacijos']}>
        <Sidebar />
      </MemoryRouter>
    )

    await waitFor(() => {
      const link = screen.getByText('Senas pokalbis').closest('a')
      expect(link).toHaveAttribute('href', '/rekomendacijos/1')
    })
  })

  // Patikrinti reagavimą į pervadinimą (custom event)
  test('updates conversation title on custom event "conversation-renamed"', async () => {
    api.get.mockResolvedValue({ data: mockConversations })
    
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    await waitFor(() => screen.getByText('Senas pokalbis'))

    // Trigger custom event
    fireEvent(window, new CustomEvent('conversation-renamed', {
      detail: { id: '1', title: 'Atnaujintas' }
    }))

    expect(screen.getByText('Atnaujintas')).toBeInTheDocument()
    expect(screen.queryByText('Senas pokalbis')).not.toBeInTheDocument()
  })

  // Patikrinti, ar komponentas teisingai reaguoja į vartotojo prisijungimo būseną
  // Kadangi dabartinis Sidebar neturi tiesioginės priklausomybės nuo AuthContext,
  // simuliuojame, kad api.get grąžina 401 klaidą (neprisijungęs)
  test('handles 401 Unauthorized gracefully (not showing history)', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    api.get.mockRejectedValue({ response: { status: 401 } })
    
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.queryByText('Pokalbių istorija')).not.toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch conversations', expect.any(Object))
    consoleSpy.mockRestore()
  })
})
