import express from 'express'
import cors from 'cors'
import apiRoutes from './routes/index.js'
import authRoutes from './modules/auth/auth.routes.js'
import uploadRouter from './modules/upload/upload.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', apiRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/documents/upload', uploadRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Puslapis nerastas' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `Failas per didelis. Maksimalus dydis: ${process.env.UPLOAD_MAX_SIZE_MB || 10} MB` })
  }
  if (err.message?.includes('Netinkamas failo tipas')) {
    return res.status(415).json({ error: err.message })
  }
  res.status(500).json({ error: err.message || 'Vidinė serverio klaida' })
})

export default app
