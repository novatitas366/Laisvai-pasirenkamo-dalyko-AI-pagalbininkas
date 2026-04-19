/**
 * Unit tests for upload.service.js (SCRUM-37)
 *
 * Uses Jest native ESM (--experimental-vm-modules).
 * pdf-parse v2 exports PDFParse class (mocked below).
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals'

const TEXT_LIMIT = 100_000

// ── Mock declarations ────────────────────────────────────────────────────────
// These must run before the dynamic import of the module under test.

const mockReadFile = jest.fn()
const mockUnlink   = jest.fn()

await jest.unstable_mockModule('fs/promises', () => ({
  default: { readFile: mockReadFile, unlink: mockUnlink },
}))

const mockMammoth = { extractRawText: jest.fn() }

await jest.unstable_mockModule('mammoth', () => ({
  default: mockMammoth,
}))

let lastPdfParseOpts
await jest.unstable_mockModule('pdf-parse', () => ({
  PDFParse: class {
    constructor(opts) {
      lastPdfParseOpts = opts
    }
    async getText() {
      return { text: 'extracted pdf text' }
    }
    async destroy() {}
  },
}))

// ── Load module under test after mocks are set up ───────────────────────────
const { extractTextFromFile, deleteFile } =
  await import('../src/modules/upload/upload.service.js')

// ── Helpers ──────────────────────────────────────────────────────────────────
beforeEach(() => {
  jest.clearAllMocks()
  lastPdfParseOpts = undefined
})

// ── extractTextFromFile ───────────────────────────────────────────────────────

describe('extractTextFromFile', () => {
  // ── PDF ──────────────────────────────────────────────────────────────────
  describe('PDF (application/pdf)', () => {
    it('reads the file buffer and returns text from PDFParse.getText()', async () => {
      const fakeBuf = Buffer.from('fake pdf bytes')
      mockReadFile.mockResolvedValue(fakeBuf)

      const result = await extractTextFromFile('/tmp/doc.pdf', 'application/pdf')

      expect(mockReadFile).toHaveBeenCalledWith('/tmp/doc.pdf')
      expect(lastPdfParseOpts?.data).toEqual(fakeBuf)
      expect(result).toBe('extracted pdf text')
    })
  })

  // ── DOCX / DOC ────────────────────────────────────────────────────────────
  describe('DOCX (application/vnd.openxmlformats-officedocument.wordprocessingml.document)', () => {
    it('calls mammoth.extractRawText with the file path and returns value', async () => {
      mockMammoth.extractRawText.mockResolvedValue({ value: 'docx content' })

      const result = await extractTextFromFile(
        '/tmp/doc.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      )

      expect(mockMammoth.extractRawText).toHaveBeenCalledWith({ path: '/tmp/doc.docx' })
      expect(result).toBe('docx content')
    })
  })

  describe('DOC (application/msword)', () => {
    it('throws error for application/msword (no longer supported)', async () => {
      await expect(
        extractTextFromFile('/tmp/doc.doc', 'application/msword')
      ).rejects.toThrow('Netinkamas failo tipas. Leidžiami: PDF, DOCX, TXT')
    })
  })

  // ── TXT ───────────────────────────────────────────────────────────────────
  describe('TXT (text/plain)', () => {
    it('reads file as utf-8 and returns its contents', async () => {
      mockReadFile.mockResolvedValue('plain text content')

      const result = await extractTextFromFile('/tmp/doc.txt', 'text/plain')

      expect(mockReadFile).toHaveBeenCalledWith('/tmp/doc.txt', 'utf-8')
      expect(result).toBe('plain text content')
    })
  })

  // ── Unsupported MIME ──────────────────────────────────────────────────────
  describe('Unsupported MIME type', () => {
    it('throws an error with the expected Lithuanian message', async () => {
      await expect(
        extractTextFromFile('/tmp/image.png', 'image/png')
      ).rejects.toThrow('Netinkamas failo tipas. Leidžiami: PDF, DOCX, TXT')
    })
  })

  // ── TEXT_LIMIT ────────────────────────────────────────────────────────────
  describe('TEXT_LIMIT enforcement', () => {
    it('slices text that exceeds 100 000 characters', async () => {
      const longText = 'a'.repeat(TEXT_LIMIT + 500)
      mockReadFile.mockResolvedValue(longText)

      const result = await extractTextFromFile('/tmp/big.txt', 'text/plain')

      expect(result).toHaveLength(TEXT_LIMIT)
      expect(result).toBe(longText.slice(0, TEXT_LIMIT))
    })

    it('returns full text when it is within the limit', async () => {
      const shortText = 'hello world'
      mockReadFile.mockResolvedValue(shortText)

      const result = await extractTextFromFile('/tmp/small.txt', 'text/plain')

      expect(result).toBe('hello world')
    })

    it('returns full text when length equals TEXT_LIMIT exactly', async () => {
      const exactText = 'b'.repeat(TEXT_LIMIT)
      mockReadFile.mockResolvedValue(exactText)

      const result = await extractTextFromFile('/tmp/exact.txt', 'text/plain')

      expect(result).toHaveLength(TEXT_LIMIT)
    })
  })

  // ── Timeout ───────────────────────────────────────────────────────────────
  describe('Timeout behaviour (15 s)', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('rejects with a Lithuanian timeout message when processing exceeds 15 s', async () => {
      // readFile hangs indefinitely
      mockReadFile.mockImplementation(() => new Promise(() => {}))

      const promise = extractTextFromFile('/tmp/slow.txt', 'text/plain')
      jest.advanceTimersByTime(15_001)

      await expect(promise).rejects.toThrow(
        'Failo apdorojimas viršijo 15 sekundžių limitą'
      )
    })

    it('resolves normally when extraction completes before the timeout', async () => {
      mockReadFile.mockResolvedValue('fast content')

      const promise = extractTextFromFile('/tmp/fast.txt', 'text/plain')

      await expect(promise).resolves.toBe('fast content')
    })
  })
})

// ── deleteFile ────────────────────────────────────────────────────────────────

describe('deleteFile', () => {
  it('calls fs.unlink with the given path', async () => {
    mockUnlink.mockResolvedValue(undefined)

    await deleteFile('/tmp/file.txt')

    expect(mockUnlink).toHaveBeenCalledWith('/tmp/file.txt')
  })

  it('does not throw when fs.unlink rejects (file already deleted)', async () => {
    mockUnlink.mockRejectedValue(new Error('ENOENT: no such file or directory'))

    await expect(deleteFile('/tmp/gone.txt')).resolves.toBeUndefined()
  })
})
