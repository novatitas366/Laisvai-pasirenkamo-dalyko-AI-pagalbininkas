/**
 * Vienetų testai: chatHandler (server/src/modules/ai/chat.controller.js)
 * ND2, Studentas 2, B2. Tikrina tai, ko HTTP testai nemato:
 * nepavykęs rekomendacijos išsaugojimas užregistruojamas per logger'į.
 */
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockGetChatResponse = jest.fn()
const mockSaveRecommendation = jest.fn()
const mockLoggerError = jest.fn()

await jest.unstable_mockModule('../src/modules/ai/ai.service.js', () => ({
  getChatResponse: mockGetChatResponse,
}))
await jest.unstable_mockModule('../src/modules/recommendations/recommendations.service.js', () => ({
  saveRecommendation: mockSaveRecommendation,
}))
await jest.unstable_mockModule('../src/utils/logger.js', () => ({
  default: { error: mockLoggerError, warn: jest.fn(), info: jest.fn() },
}))

const { chatHandler } = await import('../src/modules/ai/chat.controller.js')

function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

const messages = [{ role: 'user', content: 'Labas' }]
const recommendation = { subjects: ['Algoritmai'], explanations: ['Svarbu.'] }

beforeEach(() => {
  jest.clearAllMocks()
})

describe('chatHandler', () => {
  it('nepavykus išsaugoti rekomendacijos, klaidą užregistruoja per logger.error', async () => {
    const dbError = new Error('DB nepasiekiama')
    mockGetChatResponse.mockResolvedValue({ text: 'Tekstas', recommendation })
    mockSaveRecommendation.mockRejectedValue(dbError)
    const res = buildRes()

    await chatHandler({ body: { messages } }, res, jest.fn())
    await new Promise(setImmediate)

    expect(res.json).toHaveBeenCalledWith({ text: 'Tekstas\n**Algoritmai** — Svarbu.' })
    expect(mockLoggerError).toHaveBeenCalledWith('Nepavyko išsaugoti rekomendacijos', dbError)
  })

  it('sėkmingai išsaugojus, logger.error nekviečiamas', async () => {
    mockGetChatResponse.mockResolvedValue({ text: 'Tekstas', recommendation })
    mockSaveRecommendation.mockResolvedValue(undefined)

    await chatHandler({ body: { messages } }, buildRes(), jest.fn())
    await new Promise(setImmediate)

    expect(mockLoggerError).not.toHaveBeenCalled()
  })

  it('netinkama įvestis grąžina 400 ir AI nekviečia', async () => {
    const res = buildRes()

    await chatHandler({ body: {} }, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'messages yra privalomas' })
    expect(mockGetChatResponse).not.toHaveBeenCalled()
  })

  it('AI klaidą perduoda į next', async () => {
    const aiError = new Error('AI nepasiekiamas')
    mockGetChatResponse.mockRejectedValue(aiError)
    const next = jest.fn()

    await chatHandler({ body: { messages } }, buildRes(), next)

    expect(next).toHaveBeenCalledWith(aiError)
  })
})
