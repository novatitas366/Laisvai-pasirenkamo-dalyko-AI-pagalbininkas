import { Router } from 'express'
import { getChatResponse } from './ai.service.js'
import { saveRecommendation } from '../recommendations/recommendations.service.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { systemPrompt, messages } = req.body

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages yra privalomas' })
    }

    const { text, recommendation } = await getChatResponse(systemPrompt, messages)

    if (recommendation) {
      const userId = req.user?.id ?? null
      saveRecommendation(userId, { systemPrompt, messages }, recommendation).catch(() => {})
    }

    res.json({ text })
  } catch (err) {
    next(err)
  }
})

export default router
