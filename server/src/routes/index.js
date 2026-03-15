import { Router } from 'express'
import authRoutes from '../modules/auth/auth.routes.js'
import studyProgramsRouter from './studyPrograms.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/study-programs', studyProgramsRouter)

export default router
