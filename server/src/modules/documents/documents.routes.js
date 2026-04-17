import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { upload, uploadDocument } from '../upload/upload.controller.js'
import { getDocumentTexts, listDocuments, getDocument, deleteDocument } from './documents.controller.js'

const router = Router()

router.post('/upload', authenticate, upload.single('file'), uploadDocument)
router.get('/texts', authenticate, getDocumentTexts)
router.get('/', authenticate, listDocuments)
router.get('/:id', authenticate, getDocument)
router.delete('/:id', authenticate, deleteDocument)

export default router
