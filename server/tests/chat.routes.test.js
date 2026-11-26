/**
 * Charakterizaciniai vienetų testai: POST /api/chat handleris
 * (server/src/modules/ai/chat.routes.js)
 *
 * ND2, Studentas 2, vieta B2. Testai užfiksuoja DABARTINĘ elgseną prieš
 * pertvarkymą; po pertvarkymo jie turi praeiti nepakeisti.
 *
 * AI servisas ir rekomendacijų servisas (DB) imituojami, todėl testuojamas
 * tik pats handleris. Router'is prijungiamas prie mažos express programos,
 * kad testai nepriklausytų nuo to, kur handleris bus perkeltas.
 *
 * Paleidimas: npm run test:s2:chat
 */

import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockGetChatResponse = jest.fn()
const mockSaveRecommendation = jest.fn()

await jest.unstable_mockModule('../src/modules/ai/ai.service.js', () => ({
  getChatResponse: mockGetChatResponse,
}))

await jest.unstable_mockModule(
  '../src/modules/recommendations/recommendations.service.js',
  () => ({
    saveRecommendation: mockSaveRecommendation,
  })
)

const { default: express } = await import('express')
const { default: supertest } = await import('supertest')
const { default: chatRoutes } = await import('../src/modules/ai/chat.routes.js')

function buildApp(user) {
  const app = express()
  app.use(express.json())
  if (user) {
    app.use((req, _res, next) => {
      req.user = user
      next()
    })
  }
  app.use('/api/chat', chatRoutes)
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    res.status(500).json({ error: err.message })
  })
  return app
}

const messages = [{ role: 'user', content: 'Kokį dalyką rinktis?' }]
const systemPrompt = 'Tu esi studijų patarėjas'

const recommendation = {
  subjects: ['Dirbtinis intelektas', 'Duomenų bazės'],
  explanations: ['Tinka programuotojui.', 'Naudinga praktikoje.'],
}

beforeEach(() => {
  jest.clearAllMocks()
  mockSaveRecommendation.mockResolvedValue(undefined)
})

describe('POST /api/chat – įvesties tikrinimas', () => {
  it('grąžina 400, kai messages nenurodytas', async () => {
    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'messages yra privalomas' })
    expect(mockGetChatResponse).not.toHaveBeenCalled()
  })

  it('grąžina 400, kai messages yra tuščias masyvas', async () => {
    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages: [] })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'messages yra privalomas' })
    expect(mockGetChatResponse).not.toHaveBeenCalled()
  })

  it('grąžina 400, kai messages nėra masyvas', async () => {
    const res = await supertest(buildApp()).post('/api/chat').send({ messages: 'labas' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ error: 'messages yra privalomas' })
  })
})

describe('POST /api/chat – atsakymas be rekomendacijos', () => {
  it('grąžina AI tekstą nepakeistą ir rekomendacijos neišsaugo', async () => {
    mockGetChatResponse.mockResolvedValue({ text: 'Labas! Kuo galiu padėti?', recommendation: null })

    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ text: 'Labas! Kuo galiu padėti?' })
    expect(mockGetChatResponse).toHaveBeenCalledWith(systemPrompt, messages)
    expect(mockSaveRecommendation).not.toHaveBeenCalled()
  })
})

describe('POST /api/chat – atsakymas su rekomendacija', () => {
  it('prie teksto prideda suformatuotą dalykų sąrašą', async () => {
    mockGetChatResponse.mockResolvedValue({ text: 'Štai mano pasiūlymai:', recommendation })

    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      text:
        'Štai mano pasiūlymai:\n' +
        '**Dirbtinis intelektas** — Tinka programuotojui.\n' +
        '**Duomenų bazės** — Naudinga praktikoje.',
    })
  })

  it('kai AI teksto nėra, grąžina tik dalykų sąrašą', async () => {
    mockGetChatResponse.mockResolvedValue({ text: '', recommendation })

    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages })

    expect(res.body).toEqual({
      text:
        '**Dirbtinis intelektas** — Tinka programuotojui.\n' +
        '**Duomenų bazės** — Naudinga praktikoje.',
    })
  })

  it('kai paaiškinimo trūksta, po brūkšnio palieka tuščią vietą', async () => {
    mockGetChatResponse.mockResolvedValue({
      text: 'Pasiūlymai:',
      recommendation: { subjects: ['Algoritmai', 'Tinklai'], explanations: ['Svarbu.'] },
    })

    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages })

    expect(res.body).toEqual({
      text: 'Pasiūlymai:\n**Algoritmai** — Svarbu.\n**Tinklai** — ',
    })
  })

  it('neprisijungusiam vartotojui rekomendaciją išsaugo su userId = null', async () => {
    mockGetChatResponse.mockResolvedValue({ text: 'Tekstas', recommendation })

    await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages })

    expect(mockSaveRecommendation).toHaveBeenCalledTimes(1)
    expect(mockSaveRecommendation).toHaveBeenCalledWith(null, { systemPrompt, messages }, recommendation)
  })

  it('prisijungusiam vartotojui rekomendaciją išsaugo su jo id', async () => {
    mockGetChatResponse.mockResolvedValue({ text: 'Tekstas', recommendation })

    await supertest(buildApp({ id: 42 })).post('/api/chat').send({ systemPrompt, messages })

    expect(mockSaveRecommendation).toHaveBeenCalledWith(42, { systemPrompt, messages }, recommendation)
  })

  it('nepavykus išsaugoti rekomendacijos, vartotojas vis tiek gauna atsakymą 200', async () => {
    mockGetChatResponse.mockResolvedValue({ text: 'Tekstas', recommendation })
    mockSaveRecommendation.mockRejectedValue(new Error('DB nepasiekiama'))

    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages })

    expect(res.status).toBe(200)
    expect(res.body.text).toContain('**Dirbtinis intelektas** — Tinka programuotojui.')
  })
})

describe('POST /api/chat – AI serviso klaida', () => {
  it('klaidą perduoda klaidų apdorojimo middleware (next(err))', async () => {
    mockGetChatResponse.mockRejectedValue(new Error('AI nepasiekiamas'))

    const res = await supertest(buildApp()).post('/api/chat').send({ systemPrompt, messages })

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'AI nepasiekiamas' })
    expect(mockSaveRecommendation).not.toHaveBeenCalled()
  })
})
