/**
 * Integration tests for POST /api/auth/register (SCRUM-54)
 *
 * Testuojama: auth.controller.js + auth.service.js integracija
 *
 * Mocks:
 *   - config/database.js → pool.execute
 *   - argon2             → hash (TA-03 patikrinimui)
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'

// ── Database pool mock ────────────────────────────────────────────────────────
const mockPoolExecute = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { execute: mockPoolExecute },
}))

// ── argon2 mock ───────────────────────────────────────────────────────────────
const mockArgon2Hash = jest.fn()
const ARGON2ID = 2 // tikroji argon2.argon2id reikšmė

await jest.unstable_mockModule('argon2', () => ({
  default: {
    hash:     mockArgon2Hash,
    argon2id: ARGON2ID,
  },
}))

// ── Load app AFTER all mocks are in place ─────────────────────────────────────
const { default: app } = await import('../src/app.js')

beforeEach(() => {
  jest.clearAllMocks()
})

// ─────────────────────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {

  it('TA-01: sėkminga registracija grąžina 201 ir userId', async () => {
    // SELECT → el. paštas neegzistuoja
    mockPoolExecute.mockResolvedValueOnce([[], []])
    // INSERT → nauja eilutė
    mockPoolExecute.mockResolvedValueOnce([{ insertId: 1 }, []])

    mockArgon2Hash.mockResolvedValue('$argon2id$hashed_password')

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Test1@abc' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('userId', 1)
  })

  it('TA-02: registracija su jau egzistuojančiu el. paštu grąžina 409', async () => {
    // SELECT → el. paštas jau užregistruotas
    mockPoolExecute.mockResolvedValueOnce([[{ id: 1 }], []])

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Test1@abc' })

    expect(res.status).toBe(409)
  })

  it('TA-03: slaptažodis užšifruojamas argon2id algoritmu', async () => {
    // SELECT → el. paštas neegzistuoja
    mockPoolExecute.mockResolvedValueOnce([[], []])
    // INSERT → nauja eilutė
    mockPoolExecute.mockResolvedValueOnce([{ insertId: 1 }, []])

    mockArgon2Hash.mockResolvedValue('$argon2id$hashed_password')

    await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'Test1@abc' })

    expect(mockArgon2Hash).toHaveBeenCalledWith(
      'Test1@abc',
      { type: ARGON2ID },
    )
  })
})
