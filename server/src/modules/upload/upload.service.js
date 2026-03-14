import fs from 'fs/promises'
import path from 'path'
import { createRequire } from 'module'
import mammoth from 'mammoth'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

export async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === 'application/pdf') {
    const buffer = await fs.readFile(filePath)
    const data = await pdfParse(buffer)
    return data.text
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

  throw new Error('Nepalaicomas failo tipas')
}

export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath)
  } catch {
    // Failas jau ištrintas arba neegzistuoja
  }
}
