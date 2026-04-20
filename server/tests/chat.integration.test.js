/**
 * Integracinis testas: SCRUM-47
 * Sistema turi atvaizduoti ankstesnius pokalbius su DI
 *
 * Tikrinama sąveika: HTTP → conversations.controller.js → conversations.service.js → DB (mock)
 *
 * PASTABA: conversations.routes.js šiuo metu neturi authenticate middleware.
 * TA-02 testuoja JWT apsaugos reikalavimą — šis testas FAILS tol, kol
 * authenticate nebus pridėtas prie GET /api/conversations maršruto.
 *
 * Paleidimas:
 *   npm run test:integration:chat
 */

import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals'

// ── DB pool mock (turi būti PRIEŠ bet kokį importą, naudojantį pool) ─────────
const mockPoolQuery   = jest.fn()
const mockPoolExecute = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: {
    query:   mockPoolQuery,
    execute: mockPoolExecute,
  },
}))

// ── JWT_SECRET turi būti nustatytas prieš app importą ────────────────────────
process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret'

// ── Importuojame app ir supertest po mock'ų ───────────────────────────────────
const { default: app }        = await import('../src/app.js')
const { default: supertest }  = await import('supertest')
const { default: jwt }        = await import('jsonwebtoken')

const request = supertest(app)

// ── Pagalbinė funkcija: sukuria galiojantį JWT ────────────────────────────────
function makeToken(userId = 1) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

// ── Testiniai duomenys ────────────────────────────────────────────────────────
const MOCK_CONVERSATIONS = [
  { id: 3, title: 'Trečias pokalbis', date: '2024-03-15T10:00:00.000Z', updated_at: '2024-03-15T10:00:00.000Z' },
  { id: 2, title: 'Antras pokalbis',  date: '2024-02-10T09:00:00.000Z', updated_at: '2024-02-10T09:00:00.000Z' },
  { id: 1, title: 'Pirmas pokalbis',  date: '2024-01-05T08:00:00.000Z', updated_at: '2024-01-05T08:00:00.000Z' },
]

beforeEach(() => {
  jest.clearAllMocks()
})

afterAll(() => {
  jest.restoreAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-01: Sėkmingas pokalbių gavimas (200 OK) + rūšiavimo patikra
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-01 | GET /api/conversations — sėkmingas gavimas ir rūšiavimas', () => {
  it('grąžina 200 ir pokalbių masyvą surūšiuotą nuo naujausio iki seniausio', async () => {
    mockPoolQuery.mockResolvedValueOnce([MOCK_CONVERSATIONS])

    const token = makeToken(1)
    const res   = await request
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(3)

    // Patikrinti rūšiavimą: kiekvienas updated_at turi būti >= sekančio
    for (let i = 0; i < res.body.length - 1; i++) {
      const current = new Date(res.body[i].updated_at).getTime()
      const next    = new Date(res.body[i + 1].updated_at).getTime()
      expect(current).toBeGreaterThanOrEqual(next)
    }

    // Patikrinti, kad DB užklausa iškviestas su WHERE user_id ir ORDER BY updated_at DESC
    expect(mockPoolQuery).toHaveBeenCalledWith(
      expect.stringContaining('ORDER BY updated_at DESC'),
      expect.arrayContaining([1])
    )
  })

  it('grąžina tuščią masyvą, kai pokalbių nėra', async () => {
    mockPoolQuery.mockResolvedValueOnce([[]])

    const token = makeToken(1)
    const res   = await request
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-02: Neautorizuota prieiga (401) be JWT žetono
// PASTABA: Šis testas FAILS — conversations.routes.js dar neturi authenticate.
//          Pridėjus middleware, šis testas turi PASS.
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-02 | GET /api/conversations — neautorizuota prieiga (JWT apsauga)', () => {
  it('grąžina 401, kai Authorization antraštė nepateikta', async () => {
    const res = await request.get('/api/conversations')

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
    // DB neturėtų būti pasiekta neautorizuoto vartotojo atveju
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('grąžina 401, kai pateiktas neteisingas JWT žetonas', async () => {
    const res = await request
      .get('/api/conversations')
      .set('Authorization', 'Bearer neteisingas.zetonas.cia')

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('grąžina 401, kai Authorization antraštė pateikta be Bearer prefikso', async () => {
    const token = makeToken(1)
    const res   = await request
      .get('/api/conversations')
      .set('Authorization', token) // trūksta "Bearer "

    expect(res.status).toBe(401)
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-03: Greičio reikalavimas — atsakymas < 200ms
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-03 | GET /api/conversations — greičio reikalavimas (< 200ms)', () => {
  it('užklausa įvykdoma per mažiau nei 200ms', async () => {
    mockPoolQuery.mockResolvedValueOnce([MOCK_CONVERSATIONS])

    const token = makeToken(1)
    const start = Date.now()

    await request
      .get('/api/conversations')
      .set('Authorization', `Bearer ${token}`)

    const duration = Date.now() - start
    expect(duration).toBeLessThan(200)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TA-04: Pokalbio pavadinimo 100 simbolių riba (PATCH rename)
// ─────────────────────────────────────────────────────────────────────────────
describe('TA-04 | PATCH /api/conversations/:id/rename — 100 simbolių riba', () => {
  it('sutrumpina pavadinimą iki 100 simbolių ir išsaugo', async () => {
    const longTitle      = 'A'.repeat(150)
    const truncatedTitle = 'A'.repeat(100)

    mockPoolExecute
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[
        { id: 1, title: truncatedTitle, date: '2024-01-05T08:00:00.000Z', updated_at: '2024-01-05T08:00:00.000Z' },
      ]])

    const token = makeToken(1)
    const res   = await request
      .patch('/api/conversations/1/rename')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: longTitle })

    expect(res.status).toBe(200)
    expect(res.body.title).toHaveLength(100)
    expect(res.body.title).toBe(truncatedTitle)

    // Patikrinti, kad UPDATE iškviestas su sutrumpintu pavadinimu
    expect(mockPoolExecute).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('UPDATE conversations'),
      [truncatedTitle, 1]
    )
  })

  it('grąžina 400, kai pavadinimas tuščias', async () => {
    const token = makeToken(1)
    const res   = await request
      .patch('/api/conversations/1/rename')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
    expect(mockPoolExecute).not.toHaveBeenCalled()
  })

  it('priima lygiai 100 simbolių pavadinimą be sutrumpinimo', async () => {
    const exactTitle = 'B'.repeat(100)

    mockPoolExecute
      .mockResolvedValueOnce([{ affectedRows: 1 }])
      .mockResolvedValueOnce([[
        { id: 1, title: exactTitle, date: '2024-01-05T08:00:00.000Z', updated_at: '2024-01-05T08:00:00.000Z' },
      ]])

    const token = makeToken(1)
    const res   = await request
      .patch('/api/conversations/1/rename')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: exactTitle })

    expect(res.status).toBe(200)
    expect(res.body.title).toHaveLength(100)
  })
})
