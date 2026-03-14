import express from 'express'
import cors from 'cors'
import studyProgramsRouter from './routes/studyPrograms.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/study-programs', studyProgramsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
