import { Router } from 'express'
import { getAll, getSubjects } from '../controllers/studyPrograms.controller.js'

const router = Router()

router.get('/', getAll)
router.get('/:id/subjects', getSubjects)

export default router
