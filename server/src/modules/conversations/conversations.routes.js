import { Router } from 'express'
import * as conversationsController from './conversations.controller.js'
import { authenticate } from '../../middleware/auth.js'

const router = Router()

router.get('/', authenticate, conversationsController.list)
router.get('/:id', authenticate, conversationsController.getMessages)
router.patch('/:id/rename', authenticate, conversationsController.rename)

export default router
