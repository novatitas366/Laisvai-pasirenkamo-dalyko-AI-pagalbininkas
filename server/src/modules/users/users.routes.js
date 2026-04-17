import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import { getDominantSubjectsHandler, saveDominantSubjectsHandler } from './users.controller.js'

const router = Router()

router.get('/dominant-subjects', authenticate, getDominantSubjectsHandler)
router.post('/dominant-subjects', authenticate, saveDominantSubjectsHandler)

export default router
