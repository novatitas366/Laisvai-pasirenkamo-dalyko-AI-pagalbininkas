import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import studyProgramsRoutes from './studyPrograms.routes.js'
import electiveCoursesRoutes from './electiveCourses.routes.js'
import recommendationsRoutes from '../modules/recommendations/recommendations.routes.js'
import usersRouter from '../modules/users/users.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/study-programs', studyProgramsRoutes)
router.use('/elective-courses', electiveCoursesRoutes)
router.use('/recommendations', recommendationsRoutes)
router.use('/user', usersRouter)

export default router
