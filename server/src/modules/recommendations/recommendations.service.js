import pool from '../../config/database.js'

// SCRUM-70: Receives structured user context and prepares it for the AI module.
// The actual AI call will be implemented in the AI integration subtask.
export async function generateRecommendation(context) {
  // TODO: pass context to AI service (ai.service.js) once implemented
  // Example: return await aiService.getRecommendation(context)
  return {
    recommendedSubject: 'Dirbtinis intelektas',
    explanation: 'Šis dalykas rekomenduojamas, nes atitinka jūsų pomėgius technologijoms, duomenų analizei ir programavimui.',
  }
}

// SCRUM-68: Saves the generated recommendation to the database.
export async function saveRecommendation(userId, inputData, aiResponse) {
  await pool.execute(
    'INSERT INTO recommendation_sessions (user_id, input_data, ai_response) VALUES (?, ?, ?)',
    [userId ?? null, JSON.stringify(inputData), JSON.stringify(aiResponse)]
  )
}
