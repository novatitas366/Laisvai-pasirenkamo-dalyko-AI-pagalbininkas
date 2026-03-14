import { Router } from 'express'
import { upload, uploadDocument } from './upload.controller.js'

const router = Router()

router.post('/', upload.single('file'), uploadDocument)

export default router
