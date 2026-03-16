import { Router } from 'express'
import { recommendationHandler } from './recommendations.controller.js'
// TODO: import { authenticate } from '../../middleware/auth.js' once auth middleware is implemented

const router = Router()

// POST /api/recommendations
// TODO: add authenticate middleware before recommendationHandler once auth is ready
router.post('/', recommendationHandler)

export default router
