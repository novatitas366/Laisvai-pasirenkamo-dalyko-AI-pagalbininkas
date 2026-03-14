import express from 'express'
import cors from 'cors'
import uploadRouter from './modules/upload/upload.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/documents/upload', uploadRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Failas per didelis' })
  }
  res.status(500).json({ error: err.message || 'Vidinė serverio klaida' })
})

export default app
