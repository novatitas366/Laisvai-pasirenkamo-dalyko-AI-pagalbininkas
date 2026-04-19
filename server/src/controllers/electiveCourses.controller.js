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

    // Validate credits are required and positive
    for (const e of validEntries) {
      if (e.credits === '' || e.credits == null) {
        return res.status(400).json({ error: `Kreditai privalomi: "${e.name}"` })
      }
      const credits = parseInt(e.credits, 10)
      if (isNaN(credits) || credits <= 0) {
        return res.status(400).json({ error: `Kreditai turi būti teigiamas skaičius: "${e.name}"` })
      }
    }

    // Prepare for bulk insert: [[user_id, name, credits, description], [...]]
    const values = validEntries.map(e => {
      const credits = parseInt(e.credits, 10)
      return [
        req.user.id,
        e.name.trim(),
        !isNaN(credits) && credits > 0 ? credits : null,
        e.description?.trim() || null
      ]
    })

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
