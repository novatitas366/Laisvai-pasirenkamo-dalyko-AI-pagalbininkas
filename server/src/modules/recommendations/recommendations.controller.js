import { generateRecommendation, saveRecommendation } from './recommendations.service.js'

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

    const recommendation = await generateRecommendation(context)

    // SCRUM-68: save to DB — req.user is set by auth middleware once implemented
    await saveRecommendation(req.user?.id ?? null, context, recommendation)

    res.status(200).json(recommendation)
  } catch (err) {
    next(err)
  }
}
