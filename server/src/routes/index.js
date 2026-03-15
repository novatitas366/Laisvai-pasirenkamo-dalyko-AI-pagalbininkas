import { Router } from 'express'
import studyProgramsRoutes from './studyPrograms.routes.js'
import electiveCoursesRoutes from './electiveCourses.routes.js'
import conversationsRoutes from '../modules/conversations/conversations.routes.js'

const router = Router()

router.use('/study-programs', studyProgramsRoutes)
router.use('/elective-courses', electiveCoursesRoutes)
router.use('/conversations', conversationsRoutes)

export default router
