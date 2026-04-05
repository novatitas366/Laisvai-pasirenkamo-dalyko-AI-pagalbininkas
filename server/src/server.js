import 'dotenv/config'
import app from './app.js'
import pool from './config/database.js'

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await pool.query('SELECT 1')
    console.log('DB prisijungta')
  } catch (err) {
    console.warn('DB nepasiekiama:', err.message)
  }

  app.listen(PORT, () => {
    console.log(`Serveris veikia: http://localhost:${PORT}`)
  })
}

start()
