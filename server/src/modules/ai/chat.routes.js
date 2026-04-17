import { Router } from 'express'
import { getChatResponse } from './ai.service.js'

const router = Router()

router.post('/', async (req, res, next) => {
  try {
    const { systemPrompt, messages } = req.body

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages yra privalomas' })
    }

    const text = await getChatResponse(systemPrompt, messages)
    res.json({ text })
  } catch (err) {
    next(err)
  }
})

export default router
