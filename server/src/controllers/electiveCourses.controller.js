import pool from '../config/database.js'

export async function createElectives(req, res, next) {
  try {
    const { entries } = req.body

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Nėra duomenų išsaugojimui' })
    }

    // Filter valid entries (must have a name)
    const validEntries = entries.filter(e => e.name.trim().length > 0)
    
    if (validEntries.length === 0) {
      return res.status(400).json({ error: 'Nėra galiojančių duomenų išsaugojimui' })
    }

    // Prepare for bulk insert: [[user_id, name, credits, description], [...]]
    const values = validEntries.map(e => [
      req.user.id,
      e.name.trim(),
      parseInt(e.credits, 10) || null,
      e.description?.trim() || null
    ])

    const query = 'INSERT INTO user_elective_courses (user_id, name, credits, description) VALUES ?'
    const [result] = await pool.query(query, [values])

    res.status(201).json({ 
      message: 'Dalykai sėkmingai išsaugoti',
      insertedCount: result.affectedRows
    })
  } catch (err) {
    next(err)
  }
}
