import fs from 'fs/promises'
import mammoth from 'mammoth'
import { PDFParse } from 'pdf-parse'

const PROCESSING_TIMEOUT_MS = 15_000
const TEXT_LIMIT = 100_000

function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error('Failo apdorojimas viršijo 15 sekundžių limitą')),
      ms
    )
  )
  return Promise.race([promise, timeout])
}

async function doExtract(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    const buffer = await fs.readFile(filePath)
    const parser = new PDFParse({ data: buffer })
    try {
      const textResult = await parser.getText()
      return textResult.text ?? ''
    } finally {
      await parser.destroy()
    }
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value
  }

  if (mimeType === 'text/plain') {
    return await fs.readFile(filePath, 'utf-8')
  }

  throw new Error('Netinkamas failo tipas. Leidžiami: PDF, DOCX, DOC, TXT')
}

export async function extractTextFromFile(filePath, mimeType) {
  const text = await withTimeout(doExtract(filePath, mimeType), PROCESSING_TIMEOUT_MS)

  if (text.length > TEXT_LIMIT) {
    return text.slice(0, TEXT_LIMIT)
  }

  return text
}

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath)
  } catch {
    // Failas jau ištrintas arba neegzistuoja
  }
}
