import { jest } from '@jest/globals'
import { renderHook, waitFor } from '@testing-library/react'
import useProfile from './useProfile'
import api from '../services/api'

describe('SCRUM-41: useProfile – hasValidHobbies', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    api.get.mockResolvedValue({ data: { subjects: [], documents: [] } })
  })

  test('hasValidHobbies yra false kai hobių nėra', async () => {
    const { result } = renderHook(() => useProfile())
    await waitFor(() => expect(result.current.profile).toBeDefined())
    expect(result.current.hasValidHobbies).toBe(false)
  })

  test('hasValidHobbies yra false kai hobių pavadinimas per trumpas (< 4 simboliai)', async () => {
    localStorage.setItem('hobbies', JSON.stringify([{ name: 'ab' }]))
    const { result } = renderHook(() => useProfile())
    await waitFor(() => expect(result.current.profile).toBeDefined())
    expect(result.current.hasValidHobbies).toBe(false)
  })

  test('hasValidHobbies yra true kai yra bent 1 validus hobis', async () => {
    localStorage.setItem('hobbies', JSON.stringify([{ name: 'kinas' }]))
    const { result } = renderHook(() => useProfile())
    await waitFor(() => expect(result.current.hasValidHobbies).toBe(true))
  })
})

describe('SCRUM-53, AC#2: useProfile – buildSystemPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    api.get.mockResolvedValue({ data: { subjects: [], documents: [] } })
  })

  test('AC#2: dominuojantys dalykai įtraukiami į sisteminį prompt\'ą', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/user/dominant-subjects')
        return Promise.resolve({ data: { subjects: [1, 2] } })
      if (url === '/documents/texts')
        return Promise.resolve({ data: { documents: [] } })
    })

    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.profile.dominantSubjects.length).toBeGreaterThan(0)
    })

    const prompt = result.current.buildSystemPrompt()
    expect(prompt).toContain('Dominantys studijų dalykai (prioritetai):')
    expect(prompt).toContain('Informatika')
  })

  test('AC#2: kai dominuojančių dalykų nėra – prompt\'e jų neminima', async () => {
    api.get.mockResolvedValue({ data: { subjects: [], documents: [] } })

    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.profile).toBeDefined()
    })

    const prompt = result.current.buildSystemPrompt()
    expect(prompt).not.toContain('Dominantys studijų dalykai')
  })

  test('AC#2: kai profilis pilnas – prompt\'e yra dominuojantys dalykai kartu su kita info', async () => {
    localStorage.setItem('profile_university', 'Vilniaus universitetas')
    localStorage.setItem('profile_study_program', 'Informatika')

    api.get.mockImplementation((url) => {
      if (url === '/user/dominant-subjects')
        return Promise.resolve({ data: { subjects: [1] } })
      if (url === '/documents/texts')
        return Promise.resolve({ data: { documents: [] } })
    })

    const { result } = renderHook(() => useProfile())

    await waitFor(() => {
      expect(result.current.profile.dominantSubjects.length).toBeGreaterThan(0)
    })

    const prompt = result.current.buildSystemPrompt()
    expect(prompt).toContain('Universitetas: Vilniaus universitetas')
    expect(prompt).toContain('Dominantys studijų dalykai (prioritetai):')
  })

  test('AC#3: dominant subjects nuskaitomi iš API kiekvieno hook mount metu', async () => {
    api.get.mockResolvedValue({ data: { subjects: [5], documents: [] } })

    renderHook(() => useProfile())

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/user/dominant-subjects')
    })
  })
})
