/**
 * Integration tests for hobbies endpoints
 *
 * Routes:
 *   GET /api/hobbies  – list hobbies for authenticated user
 *   PUT /api/hobbies  – replace hobbies for authenticated user
 *
 * Mocks:
 *   - config/database.js → pool (execute + getConnection)
 *   - jsonwebtoken       → jwt.verify (bypass real JWT validation)
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import request from 'supertest'

// ── Database mock ─────────────────────────────────────────────────────────────
const mockExecute    = jest.fn()
const mockCommit     = jest.fn()
const mockRollback   = jest.fn()
const mockRelease    = jest.fn()
const mockConnExecute = jest.fn()

const mockConnection = {
  beginTransaction: jest.fn(),
  execute:          mockConnExecute,
  commit:           mockCommit,
  rollback:         mockRollback,
  release:          mockRelease,
}

await jest.unstable_mockModule('../../../src/config/database.js', () => ({
  default: {
    execute:       mockExecute,
    getConnection: jest.fn().mockResolvedValue(mockConnection),
  },
}))

// ── JWT mock (make authenticate pass without a real secret) ───────────────────
const USER_ID = 42

await jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    verify: jest.fn().mockReturnValue({ userId: USER_ID }),
  },
}))

// ── Load app AFTER mocks ──────────────────────────────────────────────────────
const { default: app } = await import('../../../src/app.js')

// ── Helpers ───────────────────────────────────────────────────────────────────
const AUTH_HEADER = { Authorization: 'Bearer fake-token' }

function makeHobby(name, description = null) {
  return { name, description }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockConnection.beginTransaction.mockResolvedValue()
  mockCommit.mockResolvedValue()
  mockRollback.mockResolvedValue()
  mockRelease.mockResolvedValue()
})

// ── GET /api/hobbies ──────────────────────────────────────────────────────────

describe('GET /api/hobbies', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/hobbies')

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 200 with a list of hobbies for the authenticated user', async () => {
    const hobbies = [
      { id: 1, name: 'Skaitymas', description: 'Knygos' },
      { id: 2, name: 'Programavimas', description: null },
    ]
    mockExecute.mockResolvedValue([hobbies])

    const res = await request(app)
      .get('/api/hobbies')
      .set(AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(hobbies)
    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [USER_ID]
    )
  })

  it('returns 200 with an empty list when user has no hobbies', async () => {
    mockExecute.mockResolvedValue([[]])

    const res = await request(app)
      .get('/api/hobbies')
      .set(AUTH_HEADER)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

// ── PUT /api/hobbies ──────────────────────────────────────────────────────────

describe('PUT /api/hobbies', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .put('/api/hobbies')
      .send({ hobbies: [] })

    expect(res.status).toBe(401)
  })

  it('returns 400 when hobbies field is missing', async () => {
    const res = await request(app)
      .put('/api/hobbies')
      .set(AUTH_HEADER)
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('returns 400 when hobbies is not an array', async () => {
    const res = await request(app)
      .put('/api/hobbies')
      .set(AUTH_HEADER)
      .send({ hobbies: 'ne masyvas' })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/masyvas/)
  })

  it('returns 400 when hobbies array exceeds the 10-item limit', async () => {
    const hobbies = Array.from({ length: 11 }, (_, i) => makeHobby(`Hobis ${i + 1}`))

    const res = await request(app)
      .put('/api/hobbies')
      .set(AUTH_HEADER)
      .send({ hobbies })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/10/)
  })

  it('returns 200 with saved hobbies on a valid request', async () => {
    const incoming = [makeHobby('Šachmatai', 'Žaidžiu savaitgaliais')]
    const saved    = [{ id: 10, name: 'Šachmatai', description: 'Žaidžiu savaitgaliais' }]

    mockConnExecute.mockResolvedValue([saved])

    const res = await request(app)
      .put('/api/hobbies')
      .set(AUTH_HEADER)
      .send({ hobbies: incoming })

    expect(res.status).toBe(200)
    expect(res.body).toEqual(saved)
    expect(mockCommit).toHaveBeenCalledTimes(1)
    expect(mockRelease).toHaveBeenCalledTimes(1)
  })

  it('deletes existing hobbies before inserting new ones', async () => {
    const incoming = [makeHobby('Bėgimas')]
    mockConnExecute.mockResolvedValue([[{ id: 5, name: 'Bėgimas', description: null }]])

    await request(app)
      .put('/api/hobbies')
      .set(AUTH_HEADER)
      .send({ hobbies: incoming })

    const calls = mockConnExecute.mock.calls
    expect(calls[0][0]).toMatch(/DELETE/)
    expect(calls[0][1]).toContain(USER_ID)
  })

  it('returns 200 when hobbies array is empty (clears all hobbies)', async () => {
    mockConnExecute.mockResolvedValue([[]])

    const res = await request(app)
      .put('/api/hobbies')
      .set(AUTH_HEADER)
      .send({ hobbies: [] })

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
    expect(mockCommit).toHaveBeenCalledTimes(1)
  })

  it('rolls back and returns 500 when the DB throws during the transaction', async () => {
    mockConnExecute.mockRejectedValueOnce(new Error('DB klaida'))

    const res = await request(app)
      .put('/api/hobbies')
      .set(AUTH_HEADER)
      .send({ hobbies: [makeHobby('Tapyba')] })

    expect(res.status).toBe(500)
    expect(mockRollback).toHaveBeenCalledTimes(1)
    expect(mockRelease).toHaveBeenCalledTimes(1)
  })
})
