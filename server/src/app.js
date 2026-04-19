import express from 'express'
import cors from 'cors'
import router from './routes/index.js'
import documentsRouter from './modules/documents/documents.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', router)
app.use('/api/documents', documentsRouter)

app.use((req, res) => {
  res.status(404).json({ error: 'Puslapis nerastas' })
})

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: `Failas per didelis. Maksimalus dydis: ${process.env.UPLOAD_MAX_SIZE_MB || 100} MB` })
  }
  if (err.message?.includes('Netinkamas failo tipas')) {
    return res.status(415).json({ error: err.message })
  }
  const status = err.statusCode ?? 500
  res.status(status).json({ error: err.message || 'Vidinė serverio klaida' })
})

export default app
