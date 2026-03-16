import { generateRecommendation } from './recommendations.service.js'

export async function recommendationHandler(req, res, next) {
  try {
    const { studyProgram, electiveInterests, hobbies, completedCourses } = req.body

    if (!studyProgram) {
      return res.status(400).json({ error: 'Studijų programa yra privaloma' })
    }

    const context = {
      studyProgram,
      electiveInterests: electiveInterests ?? [],
      hobbies: hobbies ?? [],
      completedCourses: completedCourses ?? [],
    }

    const result = await generateRecommendation(context)
    res.status(200).json(result)
  } catch (err) {
    next(err)
  }
}
