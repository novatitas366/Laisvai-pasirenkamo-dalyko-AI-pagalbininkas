/**
 * Integraciniai testai: Profile API (SCRUM-7)
 *
 * Testuojami sluoksniai: HTTP → Express Router → authenticate middleware → Controller → Service
 * Imituojama (mock): config/database.js → pool.execute()
 * Realūs: profile.controller.js, profile.service.js, middleware/auth.js
 *
 * Įrankiai: Jest, Supertest, MySQL2 mock, jsonwebtoken
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'

// ── MySQL2 pool mock ──────────────────────────────────────────────────────────
const mockExecute = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: {
    execute:      mockExecute,
    getConnection: jest.fn(),
  },
}))

// ── JWT_SECRET aplinkos kintamasis ────────────────────────────────────────────
process.env.JWT_SECRET = 'test-secret'

// ── App importas po mock'ų ────────────────────────────────────────────────────
const { default: app } = await import('../src/app.js')

// ── Testavimo JWT žetonas ─────────────────────────────────────────────────────
const token = jwt.sign({ userId: 1 }, 'test-secret')

// ── Mock profilio duomenys ────────────────────────────────────────────────────
const mockProfile = {
  university_id:        1,
  university_name:      'Vilniaus universitetas',
  study_program_id:     1,
  study_program_name:   'Informatika',
}

// ── Testai ────────────────────────────────────────────────────────────────────

describe('SCRUM-7: Profile API – integraciniai testai', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ── GET /api/profile ────────────────────────────────────────────────────────

  describe('GET /api/profile', () => {
    it('TA-01 | Nefunkcinis (saugumas): grąžina 401 be JWT žetono', async () => {
      const res = await request(app).get('/api/profile')

      expect(res.status).toBe(401)
      expect(res.body.error).toBeDefined()
    })

    it('TA-02 | Funkcinis: grąžina 200 su profilio duomenimis su galiojančiu JWT', async () => {
      mockExecute.mockResolvedValue([[mockProfile]])

      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.university_name).toBe('Vilniaus universitetas')
      expect(res.body.study_program_name).toBe('Informatika')
    })

    it('TA-03 | Nefunkcinis (našumas): atsakymas grįžta per mažiau nei 200ms', async () => {
      mockExecute.mockResolvedValue([[mockProfile]])

      const start = Date.now()
      await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)
      const elapsed = Date.now() - start

      expect(elapsed).toBeLessThan(200)
    })

    it('TA-06 | Nefunkcinis (patikimumas): grąžina 500 kai DB išmeta klaidą', async () => {
      mockExecute.mockRejectedValue(new Error('DB jungtis nutrūko'))

      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(500)
    })
  })

  // ── PUT /api/profile ────────────────────────────────────────────────────────

  describe('PUT /api/profile', () => {
    it('TA-04 | Nefunkcinis (saugumas): grąžina 401 be JWT žetono', async () => {
      const res = await request(app)
        .put('/api/profile')
        .send({ universityId: 1, studyProgramId: 1 })

      expect(res.status).toBe(401)
    })

    it('TA-05 | Funkcinis: išsaugo profilį ir grąžina 200 su atnaujintais duomenimis', async () => {
      mockExecute
        .mockResolvedValueOnce([[{ id: 1 }]])   // SELECT — profilis egzistuoja
        .mockResolvedValueOnce([[]])             // UPDATE
        .mockResolvedValueOnce([[mockProfile]])  // SELECT po atnaujinimo

      const res = await request(app)
        .put('/api/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ universityId: 1, studyProgramId: 1 })

      expect(res.status).toBe(200)
      expect(res.body.university_name).toBe('Vilniaus universitetas')
      expect(res.body.study_program_name).toBe('Informatika')
    })
  })
})
