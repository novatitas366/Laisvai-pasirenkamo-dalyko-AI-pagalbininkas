/**
 * Unit tests for upload.controller.js (SCRUM-37)
 *
 * Mocks:
 *   - upload.service.js  → extractTextFromFile, deleteFile
 *   - config/database.js → pool.execute
 *   - multer             → skipped (we construct req.file manually)
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'

// ── Service mock ──────────────────────────────────────────────────────────────
const mockExtractTextFromFile = jest.fn()
const mockDeleteFile          = jest.fn()

await jest.unstable_mockModule('../src/modules/upload/upload.service.js', () => ({
  extractTextFromFile: mockExtractTextFromFile,
  deleteFile:          mockDeleteFile,
}))

// ── Database pool mock ────────────────────────────────────────────────────────
const mockPoolExecute = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { execute: mockPoolExecute },
}))

// ── multer mock (capture fileFilter so we can test it directly) ──────────────
let capturedFileFilter = null

await jest.unstable_mockModule('multer', () => {
  const multerInstance = (opts) => {
    if (opts?.fileFilter) capturedFileFilter = opts.fileFilter
    return {
      single: () => (_req, _res, next) => next(),
    }
  }
  multerInstance.default = multerInstance
  return { default: multerInstance }
})

// ── Load the controller AFTER all mocks are in place ─────────────────────────
const { uploadDocument } = await import('../src/modules/upload/upload.controller.js')

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json   = jest.fn().mockReturnValue(res)
  return res
}

function buildFile(overrides = {}) {
  return {
    path:         '/tmp/abc123',
    originalname: 'test.pdf',
    mimetype:     'application/pdf',
    size:         1024,
    ...overrides,
  }
}

beforeEach(() => {
  jest.clearAllMocks()
})

// ── uploadDocument ─────────────────────────────────────────────────────────────

describe('uploadDocument', () => {
  describe('when no file is attached', () => {
    it('returns 400 with "Failas nepateiktas" error', async () => {
      const req = { file: undefined }
      const res = buildRes()

      await uploadDocument(req, res)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({ error: 'Failas nepateiktas' })
      expect(mockExtractTextFromFile).not.toHaveBeenCalled()
    })
  })

  describe('when file is present and extraction succeeds', () => {
    it('returns 201 with the correct response body', async () => {
      const file    = buildFile()
      const req     = { file }
      const res     = buildRes()
      const text    = 'extracted text content'
      const insertId = 42

      mockExtractTextFromFile.mockResolvedValue(text)
      mockPoolExecute.mockResolvedValue([{ insertId }])

      await uploadDocument(req, res)

      expect(mockExtractTextFromFile).toHaveBeenCalledWith(file.path, file.mimetype)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith({
        id:             insertId,
        originalName:  file.originalname,
        mimeType:       file.mimetype,
        sizeBytes:      file.size,
        extractedLength: text.length,
        extractedText:  text,
      })
    })

    it('inserts the document into the database with correct parameters', async () => {
      const file = buildFile()
      const req  = { file }
      const res  = buildRes()

      mockExtractTextFromFile.mockResolvedValue('text')
      mockPoolExecute.mockResolvedValue([{ insertId: 1 }])

      await uploadDocument(req, res)

      expect(mockPoolExecute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO documents'),
        expect.arrayContaining([
          expect.stringContaining('abc123'), // path.basename of /tmp/abc123
          file.originalname,
          file.mimetype,
          file.size,
          'text',
        ])
      )
    })

    it('always calls deleteFile with the file path (cleanup in finally)', async () => {
      const file = buildFile()
      const req  = { file }
      const res  = buildRes()

      mockExtractTextFromFile.mockResolvedValue('text')
      mockPoolExecute.mockResolvedValue([{ insertId: 5 }])

      await uploadDocument(req, res)

      expect(mockDeleteFile).toHaveBeenCalledTimes(1)
      expect(mockDeleteFile).toHaveBeenCalledWith(file.path)
    })
  })

  describe('when extractTextFromFile throws an error', () => {
    it('returns 422 with the error message', async () => {
      const file = buildFile()
      const req  = { file }
      const res  = buildRes()

      mockExtractTextFromFile.mockRejectedValue(
        new Error('Failo apdorojimas viršijo 15 sekundžių limitą')
      )

      await uploadDocument(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failo apdorojimas viršijo 15 sekundžių limitą',
      })
    })

    it('still calls deleteFile even when extraction fails (cleanup in finally)', async () => {
      const file = buildFile()
      const req  = { file }
      const res  = buildRes()

      mockExtractTextFromFile.mockRejectedValue(new Error('timeout'))

      await uploadDocument(req, res)

      expect(mockDeleteFile).toHaveBeenCalledTimes(1)
      expect(mockDeleteFile).toHaveBeenCalledWith(file.path)
    })
  })

  describe('when pool.execute throws an error', () => {
    it('returns 422 with the DB error message', async () => {
      const file = buildFile()
      const req  = { file }
      const res  = buildRes()

      mockExtractTextFromFile.mockResolvedValue('text')
      mockPoolExecute.mockRejectedValue(new Error('DB connection failed'))

      await uploadDocument(req, res)

      expect(res.status).toHaveBeenCalledWith(422)
      expect(res.json).toHaveBeenCalledWith({ error: 'DB connection failed' })
    })

    it('still calls deleteFile when DB insert fails', async () => {
      const file = buildFile()
      const req  = { file }
      const res  = buildRes()

      mockExtractTextFromFile.mockResolvedValue('text')
      mockPoolExecute.mockRejectedValue(new Error('DB error'))

      await uploadDocument(req, res)

      expect(mockDeleteFile).toHaveBeenCalledTimes(1)
      expect(mockDeleteFile).toHaveBeenCalledWith(file.path)
    })
  })
})

// ── multer fileFilter (captured from the upload middleware options) ────────────

describe('multer fileFilter', () => {
  it('calls cb(null, true) for an allowed MIME type', () => {
    expect(capturedFileFilter).not.toBeNull()

    const cb   = jest.fn()
    const file = { mimetype: 'application/pdf' }

    capturedFileFilter({}, file, cb)

    expect(cb).toHaveBeenCalledWith(null, true)
  })

  it('calls cb(Error) for a disallowed MIME type', () => {
    const cb   = jest.fn()
    const file = { mimetype: 'image/png' }

    capturedFileFilter({}, file, cb)

    expect(cb).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Netinkamas failo tipas. Leidžiami: PDF, DOCX, DOC, TXT' })
    )
  })

  it('accepts all allowed MIME types', () => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ]

    for (const mimetype of allowed) {
      const cb = jest.fn()
      capturedFileFilter({}, { mimetype }, cb)
      expect(cb).toHaveBeenCalledWith(null, true)
    }
  })
})
