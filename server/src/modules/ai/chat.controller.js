import { getChatResponse } from './ai.service.js'
import { formatRecommendation } from './chat.service.js'
import { saveRecommendation } from '../recommendations/recommendations.service.js'
import logger from '../../utils/logger.js'

function isValidMessages(messages) {
  return Array.isArray(messages) && messages.length > 0
}

// Neprisijungusio vartotojo rekomendacija saugoma su userId = null
function getUserId(req) {
  return req.user?.id ?? null
}

// Rekomendacija saugoma fone: atsakymas vartotojui jos nelaukia,
// o nepavykęs įrašas užregistruojamas (anksčiau klaida buvo nutylima).
function saveRecommendationInBackground(userId, input, recommendation) {
  saveRecommendation(userId, input, recommendation).catch((err) => {
    logger.error('Nepavyko išsaugoti rekomendacijos', err)
  })
}

// POST /api/chat
export async function chatHandler(req, res, next) {
  try {
    const { systemPrompt, messages } = req.body

    if (!isValidMessages(messages)) {
      return res.status(400).json({ error: 'messages yra privalomas' })
    }

    const { text, recommendation } = await getChatResponse(systemPrompt, messages)

    if (recommendation) {
      saveRecommendationInBackground(getUserId(req), { systemPrompt, messages }, recommendation)
    }

    res.json({ text: formatRecommendation(text, recommendation) })
  } catch (err) {
    next(err)
  }
}
