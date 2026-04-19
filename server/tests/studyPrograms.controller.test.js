import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// ── Database pool mock ────────────────────────────────────────────────────────
const mockPoolQuery = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { query: mockPoolQuery },
}))

// ── Load controller AFTER mocks ───────────────────────────────────────────────
const { getAll, getSubjects } = await import('../src/controllers/studyPrograms.controller.js')

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

function buildNext() {
  return jest.fn()
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── getAll ─────────────────────────────────────────────────────────────────────

describe('getAll', () => {
  it('grąžina studijų programų sąrašą su universiteto info', async () => {
    const programs = [
      { id: 1, name: 'Informatika', code: 'VU-INF', university_id: 1, university_name: 'Vilniaus universitetas' },
      { id: 2, name: 'Matematika',  code: 'VU-MAT', university_id: 1, university_name: 'Vilniaus universitetas' },
    ]
    mockPoolQuery.mockResolvedValue([programs])

    const req  = {}
    const res  = buildRes()
    const next = buildNext()

    await getAll(req, res, next)

    expect(res.json).toHaveBeenCalledWith(programs)
    expect(next).not.toHaveBeenCalled()
  })

  it('grąžina tuščią masyvą kai programų nėra', async () => {
    mockPoolQuery.mockResolvedValue([[]])

    const res  = buildRes()
    const next = buildNext()

    await getAll({}, res, next)

    expect(res.json).toHaveBeenCalledWith([])
  })

  it('perduoda klaidą į next() kai DB meta exception', async () => {
    const dbError = new Error('DB connection failed')
    mockPoolQuery.mockRejectedValue(dbError)

    const res  = buildRes()
    const next = buildNext()

    await getAll({}, res, next)

    expect(next).toHaveBeenCalledWith(dbError)
    expect(res.json).not.toHaveBeenCalled()
  })

  it('užklausoje naudoja JOIN su universities ir ORDER BY', async () => {
    mockPoolQuery.mockResolvedValue([[]])

    await getAll({}, buildRes(), buildNext())

    const [sql] = mockPoolQuery.mock.calls[0]
    expect(sql).toMatch(/JOIN universities/i)
    expect(sql).toMatch(/ORDER BY/i)
  })
})

// ── getSubjects ────────────────────────────────────────────────────────────────

describe('getSubjects', () => {
  const subjects = [
    { id: 10, name: 'Programavimo pagrindai', code: 'INF001', semester: 1, credits: 6 },
    { id: 11, name: 'Duomenų bazės',          code: 'INF002', semester: 2, credits: 5 },
  ]

  describe('programa egzistuoja', () => {
    beforeEach(() => {
      mockPoolQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([subjects])
    })

    it('grąžina visus dalykus be semestro filtro', async () => {
      const req  = { params: { id: '1' }, query: {} }
      const res  = buildRes()
      const next = buildNext()

      await getSubjects(req, res, next)

      expect(res.json).toHaveBeenCalledWith(subjects)
      expect(next).not.toHaveBeenCalled()
    })

    it('dalykų užklausoje nenaudoja AND semester kai filtras nenurodytas', async () => {
      const req = { params: { id: '1' }, query: {} }

      await getSubjects(req, buildRes(), buildNext())

      const [sql, params] = mockPoolQuery.mock.calls[1]
      expect(sql).not.toMatch(/AND semester/i)
      expect(params).toEqual([1])
    })
  })

  describe('semestro filtras', () => {
    beforeEach(() => {
      mockPoolQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([[subjects[0]]])
    })

    it('grąžina tik nurodyto semestro dalykus', async () => {
      const req  = { params: { id: '1' }, query: { semester: '1' } }
      const res  = buildRes()
      const next = buildNext()

      await getSubjects(req, res, next)

      expect(res.json).toHaveBeenCalledWith([subjects[0]])
    })

    it('į SQL užklausą įtraukia AND semester ir perduoda parametrą', async () => {
      const req = { params: { id: '1' }, query: { semester: '1' } }

      await getSubjects(req, buildRes(), buildNext())

      const [sql, params] = mockPoolQuery.mock.calls[1]
      expect(sql).toMatch(/AND semester = \?/i)
      expect(params).toEqual([1, 1])
    })
  })

  describe('programa nerasta', () => {
    it('grąžina 404 su klaidos pranešimu', async () => {
      mockPoolQuery.mockResolvedValueOnce([[]])

      const req  = { params: { id: '999' }, query: {} }
      const res  = buildRes()
      const next = buildNext()

      await getSubjects(req, res, next)

      expect(res.status).toHaveBeenCalledWith(404)
      expect(res.json).toHaveBeenCalledWith({ error: 'Studijų programa nerasta' })
      expect(next).not.toHaveBeenCalled()
    })

    it('nekviečia antrojo DB query kai programa nerasta', async () => {
      mockPoolQuery.mockResolvedValueOnce([[]])

      const req = { params: { id: '999' }, query: {} }
      await getSubjects(req, buildRes(), buildNext())

      expect(mockPoolQuery).toHaveBeenCalledTimes(1)
    })
  })

  describe('DB klaida', () => {
    it('perduoda klaidą į next() kai programos tikrinimas meta exception', async () => {
      const dbError = new Error('DB timeout')
      mockPoolQuery.mockRejectedValue(dbError)

      const req  = { params: { id: '1' }, query: {} }
      const res  = buildRes()
      const next = buildNext()

      await getSubjects(req, res, next)

      expect(next).toHaveBeenCalledWith(dbError)
      expect(res.json).not.toHaveBeenCalled()
    })

    it('perduoda klaidą į next() kai dalykų query meta exception', async () => {
      const dbError = new Error('Query failed')
      mockPoolQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockRejectedValueOnce(dbError)

      const req  = { params: { id: '1' }, query: {} }
      const res  = buildRes()
      const next = buildNext()

      await getSubjects(req, res, next)

      expect(next).toHaveBeenCalledWith(dbError)
    })
  })

  describe('rezultatų tvarka', () => {
    it('dalykų užklausoje naudoja ORDER BY semester, name', async () => {
      mockPoolQuery
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([[]])

      const req = { params: { id: '1' }, query: {} }
      await getSubjects(req, buildRes(), buildNext())

      const [sql] = mockPoolQuery.mock.calls[1]
      expect(sql).toMatch(/ORDER BY semester, name/i)
    })
  })
})
