/**
 * Unit tests for documents.controller.js
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockListDocumentsByUser = jest.fn()
const mockGetDocumentForUser = jest.fn()
const mockDeleteDocumentForUser = jest.fn()

await jest.unstable_mockModule('../src/modules/documents/documents.service.js', () => ({
  listDocumentsByUser: mockListDocumentsByUser,
  getDocumentForUser: mockGetDocumentForUser,
  deleteDocumentForUser: mockDeleteDocumentForUser,
}))

const { listDocuments, getDocument, deleteDocument } = await import(
  '../src/modules/documents/documents.controller.js'
)

function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  res.send = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('listDocuments', () => {
  it('returns mapped documents for the current user', async () => {
    const req = { user: { id: 3 } }
    const res = buildRes()

    mockListDocumentsByUser.mockResolvedValue([
      {
        id: 1,
        original_name: 'a.pdf',
        mime_type: 'application/pdf',
        size_bytes: 100,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ])

    await listDocuments(req, res, jest.fn())

    expect(mockListDocumentsByUser).toHaveBeenCalledWith(3)
    expect(res.json).toHaveBeenCalledWith({
      documents: [
        {
          id: 1,
          originalName: 'a.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 100,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    })
  })
})

describe('getDocument', () => {
  it('returns 400 for invalid id', async () => {
    const req = { user: { id: 1 }, params: { id: 'x' } }
    const res = buildRes()

    await getDocument(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockGetDocumentForUser).not.toHaveBeenCalled()
  })

  it('returns 404 when document is missing', async () => {
    const req = { user: { id: 1 }, params: { id: '5' } }
    const res = buildRes()
    mockGetDocumentForUser.mockResolvedValue(null)

    await getDocument(req, res, jest.fn())

    expect(mockGetDocumentForUser).toHaveBeenCalledWith(1, 5)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns document payload when found', async () => {
    const req = { user: { id: 2 }, params: { id: '9' } }
    const res = buildRes()
    mockGetDocumentForUser.mockResolvedValue({
      id: 9,
      original_name: 'b.txt',
      mime_type: 'text/plain',
      size_bytes: 20,
      extracted_text: 'hello',
      created_at: '2026-02-01T00:00:00.000Z',
    })

    await getDocument(req, res, jest.fn())

    expect(res.json).toHaveBeenCalledWith({
      id: 9,
      originalName: 'b.txt',
      mimeType: 'text/plain',
      sizeBytes: 20,
      extractedText: 'hello',
      extractedLength: 5,
      createdAt: '2026-02-01T00:00:00.000Z',
    })
  })
})

describe('deleteDocument', () => {
  it('returns 400 for invalid id', async () => {
    const req = { user: { id: 1 }, params: { id: 'bad' } }
    const res = buildRes()

    await deleteDocument(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockDeleteDocumentForUser).not.toHaveBeenCalled()
  })

  it('returns 404 when nothing deleted', async () => {
    const req = { user: { id: 1 }, params: { id: '3' } }
    const res = buildRes()
    mockDeleteDocumentForUser.mockResolvedValue(false)

    await deleteDocument(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(404)
  })

  it('returns 204 when deleted', async () => {
    const req = { user: { id: 1 }, params: { id: '3' } }
    const res = buildRes()
    mockDeleteDocumentForUser.mockResolvedValue(true)

    await deleteDocument(req, res, jest.fn())

    expect(mockDeleteDocumentForUser).toHaveBeenCalledWith(1, 3)
    expect(res.status).toHaveBeenCalledWith(204)
    expect(res.send).toHaveBeenCalled()
  })
})
