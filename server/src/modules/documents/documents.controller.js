import * as documentsService from './documents.service.js'

function parseDocumentId(raw) {
  const id = Number.parseInt(raw, 10)
  if (!Number.isFinite(id) || id < 1 || String(id) !== String(raw).trim()) {
    return null
  }
  return id
}

export async function listDocuments(req, res, next) {
  try {
    const rows = await documentsService.listDocumentsByUser(req.user.id)
    const documents = rows.map((row) => ({
      id: row.id,
      originalName: row.original_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      createdAt: row.created_at,
    }))
    res.json({ documents })
  } catch (err) {
    next(err)
  }
}

export async function getDocument(req, res, next) {
  try {
    const documentId = parseDocumentId(req.params.id)
    if (documentId === null) {
      return res.status(400).json({ error: 'Neteisingas dokumento ID' })
    }

    const row = await documentsService.getDocumentForUser(req.user.id, documentId)
    if (!row) {
      return res.status(404).json({ error: 'Dokumentas nerastas' })
    }

    res.json({
      id: row.id,
      originalName: row.original_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      extractedText: row.extracted_text,
      extractedLength: row.extracted_text?.length ?? 0,
      createdAt: row.created_at,
    })
  } catch (err) {
    next(err)
  }
}

export async function deleteDocument(req, res, next) {
  try {
    const documentId = parseDocumentId(req.params.id)
    if (documentId === null) {
      return res.status(400).json({ error: 'Neteisingas dokumento ID' })
    }

    const deleted = await documentsService.deleteDocumentForUser(req.user.id, documentId)
    if (!deleted) {
      return res.status(404).json({ error: 'Dokumentas nerastas' })
    }

    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
