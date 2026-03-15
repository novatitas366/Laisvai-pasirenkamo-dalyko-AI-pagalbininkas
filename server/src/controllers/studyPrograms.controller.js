import pool from '../config/database.js'

export async function getAll(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, code FROM study_programs ORDER BY name'
    )
    res.json(rows)
  } catch (err) {
    next(err)
  }
}

export async function getSubjects(req, res, next) {
  try {
    const programId = parseInt(req.params.id, 10)
    const semester = req.query.semester ? parseInt(req.query.semester, 10) : null

    const [programs] = await pool.query(
      'SELECT id FROM study_programs WHERE id = ?',
      [programId]
    )
    if (programs.length === 0) {
      return res.status(404).json({ error: 'Studijų programa nerasta' })
    }

    let query = 'SELECT id, name, code, semester, credits FROM study_program_subjects WHERE study_program_id = ?'
    const params = [programId]

    if (semester !== null) {
      query += ' AND semester = ?'
      params.push(semester)
    }

    query += ' ORDER BY semester, name'

    const [rows] = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    next(err)
  }
}
