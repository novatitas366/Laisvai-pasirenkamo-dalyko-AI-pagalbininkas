/**
 * Integraciniai testai: Express + auth maršrutai, tikras Argon2, DB mock.
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'
import argon2 from 'argon2'

const mockPoolExecute = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { execute: mockPoolExecute },
}))

const request = (await import('supertest')).default
const { default: app } = await import('../src/app.js')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/auth/register', () => {
  it('įrašo Argon2 hash, ne atvirą slaptažodį', async () => {
    const email = 'naujas@example.com'
    const password = 'slaptas123'

    mockPoolExecute
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ insertId: 7 }])

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password })
      .expect(201)

    expect(res.body.userId).toBe(7)

    expect(mockPoolExecute).toHaveBeenCalledTimes(2)

    const insertArgs = mockPoolExecute.mock.calls[1][1]
    expect(insertArgs[0]).toBe(email)
    const storedHash = insertArgs[1]
    expect(storedHash).toMatch(/^\$argon2id\$/)
    expect(storedHash).not.toContain(password)
    await expect(argon2.verify(storedHash, password)).resolves.toBe(true)
  })
})

describe('POST /api/auth/login', () => {
  it('grąžina JWT, kai slaptažodis teisingas', async () => {
    const password = 'teisingas'
    const hash = await argon2.hash(password, { type: argon2.argon2id })

    mockPoolExecute.mockResolvedValueOnce([
      [{ id: 3, email: 'user@example.com', password_hash: hash }],
    ])

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password })
      .expect(200)

    expect(res.body.token).toEqual(expect.any(String))
    expect(res.body.user).toEqual({ id: 3, email: 'user@example.com' })
  })

  it('401, kai slaptažodis neteisingas', async () => {
    const hash = await argon2.hash('kitas', { type: argon2.argon2id })
    mockPoolExecute.mockResolvedValueOnce([
      [{ id: 1, email: 'a@b.lt', password_hash: hash }],
    ])

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'a@b.lt', password: 'blogas' })
      .expect(401)
  })

  it('401, kai naudotojas nerastas', async () => {
    mockPoolExecute.mockResolvedValueOnce([[]])

    await request(app)
      .post('/api/auth/login')
      .send({ email: 'nera@example.com', password: 'x' })
      .expect(401)
  })

  it('400, kai trūksta el. pašto arba slaptažodžio', async () => {
    await request(app).post('/api/auth/login').send({ email: 'a@b.lt' }).expect(400)

    await request(app).post('/api/auth/login').send({ password: 'x' }).expect(400)
  })
})
