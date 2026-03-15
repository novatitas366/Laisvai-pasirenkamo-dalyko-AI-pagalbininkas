import 'dotenv/config'
import app from './app.js'
import pool from './config/database.js'

const PORT = process.env.PORT || 3000

async function start() {
  await pool.getConnection()
  console.log('Database connected')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

start().catch(err => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
