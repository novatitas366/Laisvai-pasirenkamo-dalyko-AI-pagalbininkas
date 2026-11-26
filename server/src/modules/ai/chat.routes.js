import { Router } from 'express'
import { chatHandler } from './chat.controller.js'

const router = Router()

// POST /api/chat
router.post('/', chatHandler)

export default router
