import {
  validateElectives,
  findExistingElective,
  insertElectives,
} from '../services/electiveCourses.service.js'

export async function createElectives(req, res, next) {
  try {
    const { error, entries } = validateElectives(req.body.entries)
    if (error) {
      return res.status(400).json({ error })
    }

    const existing = await findExistingElective(req.user.id, entries)
    if (existing) {
      return res.status(409).json({
        error: `Dalykas "${existing.name}" su ${existing.credits} kreditais jau yra išsaugotas`,
      })
    }

    const insertedCount = await insertElectives(req.user.id, entries)
    res.status(201).json({
      message: 'Dalykai sėkmingai išsaugoti',
      insertedCount,
    })
  } catch (err) {
    next(err)
  }
}
