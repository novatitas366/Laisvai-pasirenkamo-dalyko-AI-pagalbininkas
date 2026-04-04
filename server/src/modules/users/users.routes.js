import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { saveDominantSubjectsHandler } from './users.controller.js'

const router = Router()

router.post('/dominant-subjects', authenticate, saveDominantSubjectsHandler)

export default router
