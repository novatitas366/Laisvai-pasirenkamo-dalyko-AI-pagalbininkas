import { jest, describe, test, expect, beforeEach } from '@jest/globals'

// ── Service mock ──────────────────────────────────────────────────────────────
const mockGetDominantSubjects = jest.fn()
const mockSaveDominantSubjects = jest.fn()

await jest.unstable_mockModule('../src/modules/users/users.service.js', () => ({
  getDominantSubjects: mockGetDominantSubjects,
  saveDominantSubjects: mockSaveDominantSubjects,
}))

const { getDominantSubjectsHandler, saveDominantSubjectsHandler } =
  await import('../src/modules/users/users.controller.js')

beforeEach(() => {
  jest.clearAllMocks()
})

// ── getDominantSubjectsHandler ────────────────────────────────────────────────

describe('SCRUM-73: getDominantSubjectsHandler', () => {
  test('AC#3: grąžina 200 su išsaugotų dalykų ID sąrašu', async () => {
    mockGetDominantSubjects.mockResolvedValue([1, 5, 12])

    const req = { user: { id: 7 } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await getDominantSubjectsHandler(req, res, next)

    expect(mockGetDominantSubjects).toHaveBeenCalledWith(7)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ subjects: [1, 5, 12] })
  })

  test('klaida perduodama next() kai service išmeta exception', async () => {
    mockGetDominantSubjects.mockRejectedValue(new Error('DB klaida'))

    const req = { user: { id: 1 } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await getDominantSubjectsHandler(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})

// ── saveDominantSubjectsHandler ───────────────────────────────────────────────

describe('SCRUM-72, SCRUM-73: saveDominantSubjectsHandler', () => {
  test('SCRUM-72: 400 kai subjects nėra masyvas', async () => {
    const req = { user: { id: 1 }, body: { subjects: 'ne-masyvas' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await saveDominantSubjectsHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nepasirinktas nė vienas dalykas' })
  })

  test('SCRUM-72: 400 kai subjects tuščias masyvas', async () => {
    const req = { user: { id: 1 }, body: { subjects: [] } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await saveDominantSubjectsHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nepasirinktas nė vienas dalykas' })
  })

  test('SCRUM-73, AC#3: 200 kai duomenys teisingi – iškviečiamas service su vartotojo ID', async () => {
    mockSaveDominantSubjects.mockResolvedValue()

    const req = { user: { id: 7 }, body: { subjects: [1, 5, 12] } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await saveDominantSubjectsHandler(req, res, next)

    expect(mockSaveDominantSubjects).toHaveBeenCalledWith(7, [1, 5, 12])
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ message: 'Dominantys dalykai išsaugoti' })
  })

  test('klaida perduodama next() kai service išmeta exception', async () => {
    mockSaveDominantSubjects.mockRejectedValue(new Error('DB klaida'))

    const req = { user: { id: 1 }, body: { subjects: [1] } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await saveDominantSubjectsHandler(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
    expect(res.status).not.toHaveBeenCalled()
  })
})
