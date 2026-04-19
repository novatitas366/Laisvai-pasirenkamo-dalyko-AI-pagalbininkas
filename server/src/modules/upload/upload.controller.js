import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { extractTextFromFile, deleteFile } from './upload.service.js'
import pool from '../../config/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR = path.resolve(__dirname, '../../../../uploads/tmp')

const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const MAX_SIZE_BYTES = (Number(process.env.UPLOAD_MAX_SIZE_MB) || 100) * 1024 * 1024

export const upload = multer({
  dest: TMP_DIR,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Netinkamas failo tipas. Leidžiami: PDF, DOCX, TXT'))
    }
  },
})

export async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Failas nepateiktas' })
  }

  const { path: filePath, originalname, mimetype, size } = req.file

  try {
    const extractedText = await extractTextFromFile(filePath, mimetype)

    const [result] = await pool.execute(
      `INSERT INTO documents (user_id, filename, original_name, mime_type, size_bytes, extracted_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, path.basename(filePath), originalname, mimetype, size, extractedText]
    )

    return res.status(201).json({
      id: result.insertId,
      originalName: originalname,
      mimeType: mimetype,
      sizeBytes: size,
      extractedLength: extractedText.length,
      extractedText,
    })
  } catch (err) {
    return res.status(422).json({ error: err.message })
  } finally {
    await deleteFile(filePath)
  }
}
