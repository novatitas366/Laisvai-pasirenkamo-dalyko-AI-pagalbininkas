import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import pool from './database.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '../../../database/migrations')

export async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         INT          NOT NULL AUTO_INCREMENT,
      filename   VARCHAR(255) NOT NULL UNIQUE,
      run_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `)

  const [rows] = await pool.query('SELECT filename FROM migrations')
  const applied = new Set(rows.map(r => r.filename))

  const files = (await readdir(MIGRATIONS_DIR))
    .filter(f => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (applied.has(file)) continue

    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean)

    for (const statement of statements) {
      await pool.query(statement)
    }

    await pool.query('INSERT INTO migrations (filename) VALUES (?)', [file])
    console.log(`Migracija įvykdyta: ${file}`)
  }
}
