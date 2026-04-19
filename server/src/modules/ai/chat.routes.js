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

    let fullText = text
    if (recommendation) {
      const userId = req.user?.id ?? null
      saveRecommendation(userId, { systemPrompt, messages }, recommendation).catch(() => {})

      const list = recommendation.subjects.map((subject, i) =>
        `**${subject}** — ${recommendation.explanations[i] ?? ''}`
      ).join('\n')
      fullText = text ? `${text}\n${list}` : list
    }

    res.json({ text: fullText })
  } catch (err) {
    next(err)
  }
})

export default router
