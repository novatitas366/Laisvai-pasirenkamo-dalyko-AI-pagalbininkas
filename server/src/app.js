import express from 'express'
import cors from 'cors'
import router from './routes/index.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api', router)

app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  res.status(status).json({ message: err.message || 'Internal server error' })
})

export default app
