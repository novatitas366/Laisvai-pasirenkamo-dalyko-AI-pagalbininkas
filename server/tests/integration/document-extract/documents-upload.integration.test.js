/**
 * Integration test – document upload flow (SCRUM-37)
 *
 * Exercises the real Express app + MySQL:
 *   register → login → upload TXT → list → get → delete → cleanup
 *
 * Requires a running MySQL with migrations applied (`npm run setup-db`).
 */

import 'dotenv/config'
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import app from '../../../src/app.js'
import pool from '../../../src/config/database.js'

const TEST_EMAIL = `integ_${Date.now()}@test.lt`
const TEST_PASSWORD = 'Secret123!'
const FILE_CONTENT = `Integracinis testas – ${Date.now()}`

let token
let userId
let uploadedDocId

beforeAll(async () => {
  await request(app)
    .post('/api/auth/register')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    .expect(201)

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_EMAIL, password: TEST_PASSWORD })
    .expect(200)

  token = loginRes.body.token
  userId = loginRes.body.user.id
  expect(token).toBeDefined()
})

afterAll(async () => {
  if (userId) {
    await pool.execute('DELETE FROM users WHERE id = ?', [userId])
  }
  await pool.end()
})

describe('Document upload integration', () => {
  it('POST /api/documents/upload – uploads a TXT file and returns extracted text', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from(FILE_CONTENT), {
        filename: 'testas.txt',
        contentType: 'text/plain',
      })
      .expect(201)

    expect(res.body).toMatchObject({
      originalName: 'testas.txt',
      mimeType: 'text/plain',
      extractedText: FILE_CONTENT,
    })
    expect(res.body.id).toBeGreaterThan(0)
    expect(res.body.sizeBytes).toBe(Buffer.byteLength(FILE_CONTENT))
    expect(res.body.extractedLength).toBe(FILE_CONTENT.length)

    uploadedDocId = res.body.id
  })

  it('GET /api/documents – newly uploaded document appears in the list', async () => {
    const res = await request(app)
      .get('/api/documents')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    const doc = res.body.documents.find((d) => d.id === uploadedDocId)
    expect(doc).toBeDefined()
    expect(doc.originalName).toBe('testas.txt')
    expect(doc.mimeType).toBe('text/plain')
  })

  it('GET /api/documents/:id – returns full document with extracted text', async () => {
    const res = await request(app)
      .get(`/api/documents/${uploadedDocId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toMatchObject({
      id: uploadedDocId,
      originalName: 'testas.txt',
      mimeType: 'text/plain',
      extractedText: FILE_CONTENT,
      extractedLength: FILE_CONTENT.length,
    })
  })

  it('DELETE /api/documents/:id – removes the document', async () => {
    await request(app)
      .delete(`/api/documents/${uploadedDocId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    await request(app)
      .get(`/api/documents/${uploadedDocId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404)
  })

  it('POST /api/documents/upload – rejects request without a file', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    expect(res.body.error).toBe('Failas nepateiktas')
  })

  it('POST /api/documents/upload – rejects unauthenticated request', async () => {
    await request(app)
      .post('/api/documents/upload')
      .attach('file', Buffer.from('text'), {
        filename: 'a.txt',
        contentType: 'text/plain',
      })
      .expect(401)
  })
})
