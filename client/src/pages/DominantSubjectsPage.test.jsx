import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DominantSubjectsPage from './DominantSubjectsPage'
import api from '../services/api'

jest.mock('../services/api')

describe('SCRUM-71, SCRUM-72: DominantSubjectsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    api.get.mockResolvedValue({ data: { subjects: [] } })
    api.post.mockResolvedValue({ data: {} })
  })

  // ── SCRUM-71: Checkboxai ────────────────────────────────────────────────────

  test('SCRUM-71, AC#1: atvaizduojami checkboxai su dalykų pavadinimais', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    expect(screen.getByText('Informatika')).toBeInTheDocument()
  })

  test('SCRUM-71, AC#1: vartotojas gali pažymėti dominantį dalyką', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    const checkbox = screen.getAllByRole('checkbox')[0]
    expect(checkbox).not.toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()
  })

  test('SCRUM-71, AC#1: vartotojas gali atžymėti dalyką', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    const checkbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    fireEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  test('SCRUM-71, AC#1: vartotojas gali pažymėti kelis dalykus', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])
    fireEvent.click(checkboxes[1])

    expect(checkboxes[0]).toBeChecked()
    expect(checkboxes[1]).toBeChecked()
  })

  test('AC#3: anksčiau išsaugoti dalykai pažymimi iš karto (GET pre-populate)', async () => {
    api.get.mockResolvedValue({ data: { subjects: [1, 2] } })

    render(<DominantSubjectsPage />)

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes[0]).toBeChecked()
      expect(checkboxes[1]).toBeChecked()
    })
  })

  // ── SCRUM-72: Mygtukas ir duomenų perdavimas ────────────────────────────────

  test('SCRUM-72: mygtukas neaktyvus kai nieko nepažymėta', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    const button = screen.getByRole('button', { name: /Išsaugoti/i })
    expect(button).toBeDisabled()
  })

  test('SCRUM-72: mygtukas aktyvus kai pažymėtas bent vienas dalykas', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    fireEvent.click(screen.getAllByRole('checkbox')[0])

    const button = screen.getByRole('button', { name: /Išsaugoti/i })
    expect(button).not.toBeDisabled()
  })

  test('SCRUM-72, AC#3: paspaudus mygtuką siunčiami pažymėtų dalykų ID į backend', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    fireEvent.click(screen.getByRole('button', { name: /Išsaugoti/i }))

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/user/dominant-subjects',
        { subjects: expect.any(Array) }
      )
    })
  })

  test('AC#3: rodomas sėkmės pranešimas po sėkmingo išsaugojimo', async () => {
    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    fireEvent.click(screen.getByRole('button', { name: /Išsaugoti/i }))

    await waitFor(() => {
      expect(screen.getByText('Dominantys dalykai sėkmingai išsaugoti.')).toBeInTheDocument()
    })
  })

  test('rodomas klaidos pranešimas kai API grąžina klaidą', async () => {
    api.post.mockRejectedValue(new Error('Network error'))

    render(<DominantSubjectsPage />)

    await waitFor(() => screen.getAllByRole('checkbox'))

    fireEvent.click(screen.getAllByRole('checkbox')[0])
    fireEvent.click(screen.getByRole('button', { name: /Išsaugoti/i }))

    await waitFor(() => {
      expect(screen.getByText(/Nepavyko pateikti duomenų/i)).toBeInTheDocument()
    })
  })
})
