import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SubjectsCatalogPage from './SubjectsCatalogPage'
import api from '../services/api'

jest.mock('../services/api')
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}))

const SUBJECTS = [
  { id: 1, name: 'Algoritmai', code: 'ALG001', semester: 1, credits: 6 },
  { id: 2, name: 'Duomenų struktūros', code: 'DS001', semester: 1, credits: 6 },
  { id: 3, name: 'Matematinė analizė', code: 'MAT001', semester: 2, credits: 6 },
]

const PROGRAMS = [
  { id: 1, name: 'Informatika', code: 'INF', university_id: 1, university_name: 'VU' },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <SubjectsCatalogPage />
    </MemoryRouter>
  )
}

beforeEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
})

// ── Kraunama ──────────────────────────────────────────────────────────────────

describe('SubjectsCatalogPage: kraujimas', () => {
  test('rodomas kraunamas indikatorius kol gaunami duomenys', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(screen.getByText('Kraunama...')).toBeInTheDocument()
  })

  test('rodomas klaidos pranešimas kai programų API grąžina klaidą', async () => {
    api.get.mockRejectedValue(new Error('Network error'))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Nepavyko užkrauti studijų programų')).toBeInTheDocument()
    })
  })
})

// ── Programa nepasirinkta ─────────────────────────────────────────────────────

describe('SubjectsCatalogPage: programa nepasirinkta', () => {
  test('rodomas pranešimas kai nėra pasirinktos programos', async () => {
    api.get.mockResolvedValue({ data: PROGRAMS })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Studijų programa nepasirinkta')).toBeInTheDocument()
    })
  })

  test('rodoma nuoroda į profilį kai programa nepasirinkta', async () => {
    api.get.mockResolvedValue({ data: PROGRAMS })

    renderPage()

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /Eiti į profilį/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/profilis')
    })
  })
})

// ── Programa pasirinkta ───────────────────────────────────────────────────────

describe('SubjectsCatalogPage: programa pasirinkta', () => {
  beforeEach(() => {
    localStorage.setItem('profile_study_program', 'Informatika')
  })

  test('rodomas programos pavadinimas ir kodas', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Informatika')).toBeInTheDocument()
      expect(screen.getByText('INF')).toBeInTheDocument()
    })
  })

  test('rodomi semestro skirtukai', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /1 semestras/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /2 semestras/i })).toBeInTheDocument()
    })
  })

  test('pirmasis semestras aktyvus pagal nutylėjimą', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Algoritmai')).toBeInTheDocument()
      expect(screen.getByText('Duomenų struktūros')).toBeInTheDocument()
    })
  })

  test('paspaudus semestro skirtuką rodomi to semestro dalykai', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => screen.getByRole('button', { name: /2 semestras/i }))

    fireEvent.click(screen.getByRole('button', { name: /2 semestras/i }))

    expect(screen.getByText('Matematinė analizė')).toBeInTheDocument()
    expect(screen.queryByText('Algoritmai')).not.toBeInTheDocument()
  })

  test('rodomas dalykų kreditų skaičius', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => {
      expect(screen.getAllByText('6 kr.').length).toBeGreaterThan(0)
    })
  })

  test('rodomas klaidos pranešimas kai dalykų API grąžina klaidą', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockRejectedValueOnce(new Error('Network error'))

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Nepavyko užkrauti dalykų')).toBeInTheDocument()
    })
  })
})

// ── Paieška ───────────────────────────────────────────────────────────────────

describe('SubjectsCatalogPage: paieška', () => {
  beforeEach(() => {
    localStorage.setItem('profile_study_program', 'Informatika')
  })

  test('paieška filtruoja dalykus pagal pavadinimą', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => screen.getByText('Algoritmai'))

    const input = screen.getByPlaceholderText(/Ieškoti dalyko/i)
    fireEvent.change(input, { target: { value: 'Algorit' } })

    expect(screen.getByText('Algoritmai')).toBeInTheDocument()
    expect(screen.queryByText('Duomenų struktūros')).not.toBeInTheDocument()
  })

  test('paieška filtruoja dalykus pagal kodą', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => screen.getByText('Algoritmai'))

    const input = screen.getByPlaceholderText(/Ieškoti dalyko/i)
    fireEvent.change(input, { target: { value: 'DS001' } })

    expect(screen.getByText('Duomenų struktūros')).toBeInTheDocument()
    expect(screen.queryByText('Algoritmai')).not.toBeInTheDocument()
  })

  test('rodomas pranešimas kai paieška neranda rezultatų', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => screen.getByText('Algoritmai'))

    const input = screen.getByPlaceholderText(/Ieškoti dalyko/i)
    fireEvent.change(input, { target: { value: 'NEEGZISTUOJA' } })

    expect(screen.getByText(/nieko nerasta/i)).toBeInTheDocument()
  })

  test('paieška išvaloma paspaudus X mygtuką', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => screen.getByText('Algoritmai'))

    const input = screen.getByPlaceholderText(/Ieškoti dalyko/i)
    fireEvent.change(input, { target: { value: 'Algorit' } })

    expect(screen.queryByText('Duomenų struktūros')).not.toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: '' })
    fireEvent.click(clearBtn)

    expect(screen.getByText('Duomenų struktūros')).toBeInTheDocument()
  })

  test('paieška nefiksuoja didžiųjų/mažųjų raidžių skirtumo', async () => {
    api.get
      .mockResolvedValueOnce({ data: PROGRAMS })
      .mockResolvedValueOnce({ data: SUBJECTS })

    renderPage()

    await waitFor(() => screen.getByText('Algoritmai'))

    const input = screen.getByPlaceholderText(/Ieškoti dalyko/i)
    fireEvent.change(input, { target: { value: 'ALGORITMAI' } })

    expect(screen.getByText('Algoritmai')).toBeInTheDocument()
  })
})
