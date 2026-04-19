import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockExecute = jest.fn()
const mockGetRecommendation = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { execute: mockExecute },
}))

await jest.unstable_mockModule('../src/modules/ai/ai.service.js', () => ({
  getRecommendation: mockGetRecommendation,
}))

const { generateRecommendation, saveRecommendation } =
  await import('../src/modules/recommendations/recommendations.service.js')

beforeEach(() => {
  jest.clearAllMocks()
  mockGetRecommendation.mockResolvedValue({
    recommendedSubject: 'Dirbtinis intelektas',
    explanation: 'Šis dalykas atitinka jūsų profilį.',
  })
})

describe('generateRecommendation', () => {
  it('grąžina objektą su recommendedSubject ir explanation laukais', async () => {
    const result = await generateRecommendation({})

    expect(result).toHaveProperty('recommendedSubject')
    expect(result).toHaveProperty('explanation')
  })

  it('grąžina teisingą struktūrą su pilnu kontekstu', async () => {
    const context = {
      studyProgram: 'Informatika',
      electiveInterests: ['Matematika'],
      hobbies: ['Programavimas'],
      completedCourses: ['Algoritmai'],
    }

    const result = await generateRecommendation(context)

    expect(typeof result.recommendedSubject).toBe('string')
    expect(typeof result.explanation).toBe('string')
  })

  it('grąžina teisingą struktūrą su tuščiu kontekstu', async () => {
    const result = await generateRecommendation({})

    expect(typeof result.recommendedSubject).toBe('string')
    expect(typeof result.explanation).toBe('string')
  })
})

describe('saveRecommendation', () => {
  it('iškviečia pool.execute su teisingu SQL INSERT', async () => {
    mockExecute.mockResolvedValue([{}])

    await saveRecommendation(1, {}, {})

    expect(mockExecute).toHaveBeenCalledWith(
      'INSERT INTO recommendation_sessions (user_id, input_data, ai_response) VALUES (?, ?, ?)',
      expect.any(Array)
    )
  })

  it('serializuoja inputData kaip JSON string', async () => {
    mockExecute.mockResolvedValue([{}])
    const inputData = { studyProgram: 'Informatika', hobbies: ['Programavimas'] }

    await saveRecommendation(1, inputData, {})

    const callArgs = mockExecute.mock.calls[0][1]
    expect(callArgs[1]).toBe(JSON.stringify(inputData))
  })

  it('serializuoja aiResponse kaip JSON string', async () => {
    mockExecute.mockResolvedValue([{}])
    const aiResponse = { recommendedSubject: 'DI', explanation: 'Puikus pasirinkimas' }

    await saveRecommendation(1, {}, aiResponse)

    const callArgs = mockExecute.mock.calls[0][1]
    expect(callArgs[2]).toBe(JSON.stringify(aiResponse))
  })

  it('veikia kai userId yra null', async () => {
    mockExecute.mockResolvedValue([{}])

    await saveRecommendation(null, {}, {})

    const callArgs = mockExecute.mock.calls[0][1]
    expect(callArgs[0]).toBeNull()
  })

  it('perduoda klaidą kai pool.execute žlunga', async () => {
    const dbError = new Error('DB klaida')
    mockExecute.mockRejectedValue(dbError)

    await expect(saveRecommendation(1, {}, {})).rejects.toThrow('DB klaida')
  })
})
