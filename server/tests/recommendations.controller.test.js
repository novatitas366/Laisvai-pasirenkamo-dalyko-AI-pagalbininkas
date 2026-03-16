import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockGenerateRecommendation = jest.fn()
const mockSaveRecommendation = jest.fn()

await jest.unstable_mockModule(
  '../src/modules/recommendations/recommendations.service.js',
  () => ({
    generateRecommendation: mockGenerateRecommendation,
    saveRecommendation: mockSaveRecommendation,
  })
)

const { recommendationHandler } =
  await import('../src/modules/recommendations/recommendations.controller.js')

const mockRecommendation = {
  recommendedSubject: 'Dirbtinis intelektas',
  explanation: 'Puikus pasirinkimas.',
}

function buildReq(body = {}, user = undefined) {
  return { body, user }
}

function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGenerateRecommendation.mockResolvedValue(mockRecommendation)
  mockSaveRecommendation.mockResolvedValue(undefined)
})

describe('recommendationHandler', () => {
  it('grąžina 400 kai studyProgram nenurodytas', async () => {
    const req = buildReq({})
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Studijų programa yra privaloma' })
  })

  it('grąžina 400 kai req.body tuščias', async () => {
    const req = buildReq({})
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('grąžina 200 su rekomendacijos duomenimis kai viskas gerai', async () => {
    const req = buildReq({ studyProgram: 'Informatika' })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(mockRecommendation)
  })

  it('perduoda teisingą kontekstą į generateRecommendation', async () => {
    const req = buildReq({
      studyProgram: 'Informatika',
      electiveInterests: ['Matematika'],
      hobbies: ['Programavimas'],
      completedCourses: ['Algoritmai'],
    })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    expect(mockGenerateRecommendation).toHaveBeenCalledWith({
      studyProgram: 'Informatika',
      electiveInterests: ['Matematika'],
      hobbies: ['Programavimas'],
      completedCourses: ['Algoritmai'],
    })
  })

  it('electiveInterests tampa [] kai nenurodytas', async () => {
    const req = buildReq({ studyProgram: 'Informatika' })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    const context = mockGenerateRecommendation.mock.calls[0][0]
    expect(context.electiveInterests).toEqual([])
  })

  it('hobbies tampa [] kai nenurodytas', async () => {
    const req = buildReq({ studyProgram: 'Informatika' })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    const context = mockGenerateRecommendation.mock.calls[0][0]
    expect(context.hobbies).toEqual([])
  })

  it('completedCourses tampa [] kai nenurodytas', async () => {
    const req = buildReq({ studyProgram: 'Informatika' })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    const context = mockGenerateRecommendation.mock.calls[0][0]
    expect(context.completedCourses).toEqual([])
  })

  it('iškviečia saveRecommendation su userId iš req.user', async () => {
    const req = buildReq({ studyProgram: 'Informatika' }, { id: 42 })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    expect(mockSaveRecommendation).toHaveBeenCalledWith(
      42,
      expect.any(Object),
      mockRecommendation
    )
  })

  it('userId yra null kai req.user nenurodytas', async () => {
    const req = buildReq({ studyProgram: 'Informatika' })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    expect(mockSaveRecommendation).toHaveBeenCalledWith(
      null,
      expect.any(Object),
      mockRecommendation
    )
  })

  it('perduoda klaidą į next() kai servisas meta exception', async () => {
    const error = new Error('Serviso klaida')
    mockGenerateRecommendation.mockRejectedValue(error)

    const req = buildReq({ studyProgram: 'Informatika' })
    const res = buildRes()
    const next = jest.fn()

    await recommendationHandler(req, res, next)

    expect(next).toHaveBeenCalledWith(error)
  })
})
