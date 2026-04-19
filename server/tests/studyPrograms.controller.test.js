import { jest, describe, test, expect, beforeEach } from '@jest/globals'

// ── DB mock ───────────────────────────────────────────────────────────────────
const mockQuery = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { query: mockQuery },
}))

const { getAll, getSubjects } = await import('../src/controllers/studyPrograms.controller.js')

beforeEach(() => {
  jest.clearAllMocks()
})

// ── getAll ────────────────────────────────────────────────────────────────────

describe('getAll', () => {
  test('grąžina 200 su studijų programų sąrašu', async () => {
    const programs = [
      { id: 1, name: 'Informatika', code: 'INF', university_id: 1, university_name: 'VU' },
      { id: 2, name: 'Matematika', code: 'MAT', university_id: 1, university_name: 'VU' },
    ]
    mockQuery.mockResolvedValue([programs])

    const req = {}
    const res = { json: jest.fn() }
    const next = jest.fn()

    await getAll(req, res, next)

    expect(mockQuery).toHaveBeenCalledTimes(1)
    expect(res.json).toHaveBeenCalledWith(programs)
    expect(next).not.toHaveBeenCalled()
  })

  test('grąžina tuščią masyvą kai nėra programų', async () => {
    mockQuery.mockResolvedValue([[]])

    const req = {}
    const res = { json: jest.fn() }
    const next = jest.fn()

    await getAll(req, res, next)

    expect(res.json).toHaveBeenCalledWith([])
  })

  test('klaida perduodama next() kai DB išmeta exception', async () => {
    mockQuery.mockRejectedValue(new Error('DB klaida'))

    const req = {}
    const res = { json: jest.fn() }
    const next = jest.fn()

    await getAll(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
    expect(res.json).not.toHaveBeenCalled()
  })
})

// ── getSubjects ───────────────────────────────────────────────────────────────

describe('getSubjects', () => {
  test('grąžina 200 su visų semestrų dalykais kai semester nenurodytas', async () => {
    const subjects = [
      { id: 10, name: 'Algoritmai', code: 'ALG001', semester: 1, credits: 6 },
      { id: 11, name: 'Matematinė analizė', code: 'MAT001', semester: 2, credits: 6 },
    ]
    mockQuery
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([subjects])

    const req = { params: { id: '1' }, query: {} }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await getSubjects(req, res, next)

    expect(res.json).toHaveBeenCalledWith(subjects)
    expect(next).not.toHaveBeenCalled()
  })

  test('filtruoja pagal semestrą kai semester nurodytas', async () => {
    const subjects = [{ id: 10, name: 'Algoritmai', code: 'ALG001', semester: 1, credits: 6 }]
    mockQuery
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([subjects])

    const req = { params: { id: '1' }, query: { semester: '1' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await getSubjects(req, res, next)

    const secondCall = mockQuery.mock.calls[1]
    expect(secondCall[0]).toContain('AND semester = ?')
    expect(secondCall[1]).toEqual([1, 1])
    expect(res.json).toHaveBeenCalledWith(subjects)
  })

  test('grąžina 404 kai programa nerasta', async () => {
    mockQuery.mockResolvedValueOnce([[]])

    const req = { params: { id: '999' }, query: {} }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await getSubjects(req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Studijų programa nerasta' })
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })

  test('grąžina tuščią masyvą kai programa neturi dalykų', async () => {
    mockQuery
      .mockResolvedValueOnce([[{ id: 1 }]])
      .mockResolvedValueOnce([[]])

    const req = { params: { id: '1' }, query: {} }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await getSubjects(req, res, next)

    expect(res.json).toHaveBeenCalledWith([])
  })

  test('klaida perduodama next() kai DB išmeta exception', async () => {
    mockQuery.mockRejectedValue(new Error('DB klaida'))

    const req = { params: { id: '1' }, query: {} }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await getSubjects(req, res, next)

    expect(next).toHaveBeenCalledWith(expect.any(Error))
  })
})
