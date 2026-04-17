import { getDominantSubjects, saveDominantSubjects } from './users.service.js'

export async function getDominantSubjectsHandler(req, res, next) {
  try {
    const subjectIds = await getDominantSubjects(req.user.id)
    res.status(200).json({ subjects: subjectIds })
  } catch (err) {
    next(err)
  }
}

export async function saveDominantSubjectsHandler(req, res, next) {
  try {
    const userId = req.user.id
    const { subjects } = req.body

    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Nepasirinktas nė vienas dalykas' })
    }

    await saveDominantSubjects(userId, subjects)
    res.status(200).json({ message: 'Dominantys dalykai išsaugoti' })
  } catch (err) {
    next(err)
  }
}
