import { Router } from 'express'
import { createElectives } from '../controllers/electiveCourses.controller.js'

const router = Router()

router.post('/', createElectives)

export default router
