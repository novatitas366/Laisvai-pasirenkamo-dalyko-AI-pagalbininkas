/**
 * Integracinis testas: pasirenkamų dalykų sąrašo pateikimas
 *
 * Tikrinama sąveika: HTTP → electiveCourses.controller.js → DB (mock)
 *
 * Paleidimas:
 *   npm run test:elective-integration
 */

import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals'

// ── DB pool mock (turi būti PRIEŠ bet kokį importą, naudojantį pool) ─────────
const mockPoolQuery = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: {
    query:   mockPoolQuery,
    execute: jest.fn(),
  },
}))

process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret'

const { default: app }       = await import('../src/app.js')
const { default: supertest } = await import('supertest')
const { default: jwt }       = await import('jsonwebtoken')

const request = supertest(app)

function makeToken(userId = 1) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-01: Sėkmingas išsaugojimas (201)
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-01 | POST /api/elective-courses — sėkmingas išsaugojimas', () => {
  it('grąžina 201 kai pateikiami teisingi duomenys', async () => {
    mockPoolQuery
      .mockResolvedValueOnce([[]])                   // duplicate check
      .mockResolvedValueOnce([{ affectedRows: 1 }])  // insert

    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: 'Matematika', credits: '6', description: '' }] })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('insertedCount', 1)
  })

  it('išsaugo kelis dalykus vienu metu', async () => {
    mockPoolQuery
      .mockResolvedValueOnce([[]])                   // duplicate check 1
      .mockResolvedValueOnce([[]])                   // duplicate check 2
      .mockResolvedValueOnce([{ affectedRows: 2 }])  // insert

    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        entries: [
          { name: 'Matematika', credits: '6', description: '' },
          { name: 'Fizika',     credits: '4', description: '' },
        ]
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('insertedCount', 2)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-02: Tuščias sąrašas (400)
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-02 | POST /api/elective-courses — tuščias sąrašas', () => {
  it('grąžina 400 kai entries masyvas tuščias', async () => {
    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [] })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('grąžina 400 kai visi pavadinimų laukai tušti', async () => {
    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: '   ', credits: '6', description: '' }] })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('grąžina 400 kai kreditai tušti', async () => {
    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: 'Matematika', credits: '', description: '' }] })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-03: Kreditų validacija (400)
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-03 | POST /api/elective-courses — kreditų validacija', () => {
  it('grąžina 400 kai kreditai neigiami', async () => {
    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: 'Matematika', credits: '-1', description: '' }] })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('grąžina 400 kai kreditai lygus nuliui', async () => {
    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: 'Matematika', credits: '0', description: '' }] })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-04: Pavadinimo 50 simbolių riba
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-04 | POST /api/elective-courses — pavadinimo ilgio riba', () => {
  it('grąžina 400 kai pavadinimas viršija 50 simbolių', async () => {
    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: 'A'.repeat(51), credits: '6', description: '' }] })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('priima pavadinimą lygiai 50 simbolių', async () => {
    mockPoolQuery
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }])

    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: 'A'.repeat(50), credits: '6', description: '' }] })

    expect(res.status).toBe(201)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-05: Dublikatų tikrinimas DB (409)
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-05 | POST /api/elective-courses — dublikatų tikrinimas', () => {
  it('grąžina 409 kai toks pats dalykas su tais pačiais kreditais jau yra DB', async () => {
    mockPoolQuery.mockResolvedValueOnce([[{ id: 1 }]]) // duplicate found

    const token = makeToken(1)
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', `Bearer ${token}`)
      .send({ entries: [{ name: 'Matematika', credits: '6', description: '' }] })

    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('error')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-06: JWT apsauga (401)
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-06 | POST /api/elective-courses — JWT apsauga', () => {
  it('grąžina 401 be Authorization antraštės', async () => {
    const res = await request
      .post('/api/elective-courses')
      .send({ entries: [{ name: 'Matematika', credits: '6', description: '' }] })

    expect(res.status).toBe(401)
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('grąžina 401 su neteisingas JWT žetonu', async () => {
    const res = await request
      .post('/api/elective-courses')
      .set('Authorization', 'Bearer neteisingas.zetonas')
      .send({ entries: [{ name: 'Matematika', credits: '6', description: '' }] })

    expect(res.status).toBe(401)
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })
})
