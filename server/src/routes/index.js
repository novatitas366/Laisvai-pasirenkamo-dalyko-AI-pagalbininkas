import { Router } from 'express'
import studyProgramsRoutes from './studyPrograms.routes.js'
import electiveCoursesRoutes from './electiveCourses.routes.js'

const router = Router()

router.use('/study-programs', studyProgramsRoutes)
router.use('/elective-courses', electiveCoursesRoutes)

export default router
