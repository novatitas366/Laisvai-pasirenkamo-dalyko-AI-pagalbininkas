import { Router } from 'express'
import { authenticate } from '../../middleware/auth.js'
import * as profileController from './profile.controller.js'

const router = Router()

router.get('/', authenticate, profileController.getProfileHandler)
router.put('/', authenticate, profileController.saveProfileHandler)

export default router
