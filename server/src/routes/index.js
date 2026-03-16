import { Router } from 'express'
import studyProgramsRoutes from './studyPrograms.routes.js'
import electiveCoursesRoutes from './electiveCourses.routes.js'
import recommendationsRoutes from '../modules/recommendations/recommendations.routes.js'

const router = Router()

router.use('/study-programs', studyProgramsRoutes)
router.use('/elective-courses', electiveCoursesRoutes)
router.use('/recommendations', recommendationsRoutes)

export default router
