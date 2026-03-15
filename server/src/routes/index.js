import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import studyProgramsRouter from './studyPrograms.routes.js'
import usersRouter from '../modules/users/users.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/study-programs', studyProgramsRouter)
router.use('/user', usersRouter)

export default router
