import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { createElectives } from '../controllers/electiveCourses.controller.js'

const router = Router()

router.post('/', authenticate, createElectives)

export default router
