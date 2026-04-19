import pool from '../../config/database.js'
import { getRecommendation } from '../ai/ai.service.js'

export async function generateRecommendation(context) {
  return await getRecommendation(context)
}

// SCRUM-68: Saves the generated recommendation to the database.
export async function saveRecommendation(userId, inputData, aiResponse) {
  await pool.execute(
    'INSERT INTO recommendation_sessions (user_id, input_data, ai_response) VALUES (?, ?, ?)',
    [userId ?? null, JSON.stringify(inputData), JSON.stringify(aiResponse)]
  )
}
