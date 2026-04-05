import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import * as hobbiesController from './hobbies.controller.js'

const router = Router()

router.get('/', authenticate, hobbiesController.list)
router.put('/', authenticate, hobbiesController.save)

export default router
