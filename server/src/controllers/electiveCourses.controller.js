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

    // Validate name length
    for (const e of validEntries) {
      if (e.name.trim().length > 50) {
        return res.status(400).json({ error: `Pavadinimas per ilgas (maks. 50 simbolių): "${e.name.trim().substring(0, 20)}..."` })
      }
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

    // Check for duplicates in DB (same name + credits for this user)
    for (const e of validEntries) {
      const credits = parseInt(e.credits, 10)
      const [existing] = await pool.query(
        'SELECT id FROM user_elective_courses WHERE user_id = ? AND LOWER(name) = LOWER(?) AND credits = ?',
        [req.user.id, e.name.trim(), credits]
      )
      if (existing.length > 0) {
        return res.status(409).json({ error: `Dalykas "${e.name}" su ${credits} kreditais jau yra išsaugotas` })
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
