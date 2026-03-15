import { Router } from 'express'
import * as conversationsController from './conversations.controller.js'

const router = Router()

router.get('/', conversationsController.list)
router.get('/:id', conversationsController.getMessages)

export default router
