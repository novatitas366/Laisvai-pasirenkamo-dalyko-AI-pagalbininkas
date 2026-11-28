import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockPoolQuery = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: {
    query: mockPoolQuery,
    execute: jest.fn(),
  },
}))

const { createElectives } = await import('../src/controllers/electiveCourses.controller.js')

const USER_ID = 7

function buildReq(body) {
  return { body, user: { id: USER_ID } }
}

function buildRes() {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

async function run(body) {
  const req = buildReq(body)
  const res = buildRes()
  const next = jest.fn()
  await createElectives(req, res, next)
  return { res, next }
}

const entry = (overrides = {}) => ({ name: 'Dirbtinis intelektas', credits: '6', description: '', ...overrides })

const noDuplicates = (count = 1) => {
  for (let i = 0; i < count; i++) mockPoolQuery.mockResolvedValueOnce([[]])
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createElectives – ND1 3.4 atvejai', () => {
  it('1. kai duomenys neatsiųsti – 400 „Nėra duomenų išsaugojimui“', async () => {
    const { res } = await run({})

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nėra duomenų išsaugojimui' })
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('2. kai atsiųstas ne sąrašas – 400 „Nėra duomenų išsaugojimui“', async () => {
    const { res } = await run({ entries: entry() })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nėra duomenų išsaugojimui' })
  })

  it('3. kai visi pavadinimai tušti – 400 „Nėra galiojančių duomenų išsaugojimui“', async () => {
    const { res } = await run({ entries: [entry({ name: '' }), entry({ name: '   ' })] })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Nėra galiojančių duomenų išsaugojimui' })
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('4. kai pavadinimas per ilgas – 400 su pirmais 20 simbolių', async () => {
    const name = `${'a'.repeat(20)}${'b'.repeat(31)}`
    const { res } = await run({ entries: [entry({ name })] })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: `Pavadinimas per ilgas (maks. 50 simbolių): "${'a'.repeat(20)}..."`,
    })
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it.each(['', null, undefined])('5. kai neįvesti kreditai (%p) – 400 „Kreditai privalomi“', async (credits) => {
    const { res } = await run({ entries: [entry({ credits })] })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'Kreditai privalomi: "Dirbtinis intelektas"' })
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it.each(['0', '-1', 'abc'])('6. kai kreditai neteisingi („%s“) – 400', async (credits) => {
    const { res } = await run({ entries: [entry({ credits })] })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Kreditai turi būti teigiamas skaičius: "Dirbtinis intelektas"',
    })
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('7. kai toks dalykas jau yra duomenų bazėje – 409, niekas neįrašoma', async () => {
    mockPoolQuery.mockResolvedValueOnce([[{ id: 1 }]])

    const { res } = await run({ entries: [entry()] })

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({
      error: 'Dalykas "Dirbtinis intelektas" su 6 kreditais jau yra išsaugotas',
    })
    expect(mockPoolQuery).toHaveBeenCalledTimes(1)
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'SELECT id FROM user_elective_courses WHERE user_id = ? AND LOWER(name) = LOWER(?) AND credits = ?',
      [USER_ID, 'Dirbtinis intelektas', 6]
    )
  })

  it('8. kai išsaugoma sėkmingai – 201, įrašomi apkarpyti duomenys', async () => {
    noDuplicates(2)
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 2 }])

    const { res } = await run({
      entries: [
        entry({ name: '  Dirbtinis intelektas ', description: '  Neuroniniai tinklai ' }),
        entry({ name: 'Kompiuterių tinklai', credits: 5 }),
      ],
    })

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith({ message: 'Dalykai sėkmingai išsaugoti', insertedCount: 2 })
    expect(mockPoolQuery).toHaveBeenLastCalledWith(
      'INSERT INTO user_elective_courses (user_id, name, credits, description) VALUES ?',
      [[
        [USER_ID, 'Dirbtinis intelektas', 6, 'Neuroniniai tinklai'],
        [USER_ID, 'Kompiuterių tinklai', 5, null],
      ]]
    )
  })

  it('9. kai duomenų bazė grąžina klaidą – klaida perduodama next', async () => {
    const dbError = new Error('DB nepasiekiama')
    mockPoolQuery.mockRejectedValueOnce(dbError)

    const { res, next } = await run({ entries: [entry()] })

    expect(next).toHaveBeenCalledWith(dbError)
    expect(res.status).not.toHaveBeenCalled()
  })

  it.each(['', '   ', undefined])('10. kai aprašymas tuščias (%p) – įrašomas null', async (description) => {
    noDuplicates()
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 1 }])

    await run({ entries: [entry({ description })] })

    expect(mockPoolQuery).toHaveBeenLastCalledWith(expect.any(String), [[[USER_ID, 'Dirbtinis intelektas', 6, null]]])
  })
})

describe('createElectives – tikrinimo tvarka ir dabartinė elgsena', () => {
  it('įrašai tuščiu pavadinimu praleidžiami ir neįrašomi', async () => {
    noDuplicates()
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 1 }])

    const { res } = await run({ entries: [entry({ name: '' }), entry()] })

    expect(res.status).toHaveBeenCalledWith(201)
    expect(mockPoolQuery).toHaveBeenCalledTimes(2)
    expect(mockPoolQuery).toHaveBeenLastCalledWith(expect.any(String), [[[USER_ID, 'Dirbtinis intelektas', 6, null]]])
  })

  it('pavadinimų ilgis tikrinamas visiems įrašams prieš kreditus', async () => {
    const { res } = await run({ entries: [entry({ credits: '' }), entry({ name: 'a'.repeat(51) })] })

    expect(res.json).toHaveBeenCalledWith({
      error: `Pavadinimas per ilgas (maks. 50 simbolių): "${'a'.repeat(20)}..."`,
    })
  })

  it('kreditai tikrinami visiems įrašams prieš dublikatų paiešką DB', async () => {
    const { res } = await run({ entries: [entry(), entry({ name: 'Kompiuterių tinklai', credits: '0' })] })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(mockPoolQuery).not.toHaveBeenCalled()
  })

  it('dublikatų paieška sustoja ties pirmu rastu dalyku', async () => {
    mockPoolQuery.mockResolvedValueOnce([[{ id: 1 }]])

    const { res } = await run({ entries: [entry(), entry({ name: 'Kompiuterių tinklai' })] })

    expect(res.status).toHaveBeenCalledWith(409)
    expect(mockPoolQuery).toHaveBeenCalledTimes(1)
  })

  it('pavadinimo ilgis skaičiuojamas su trim: 50 simbolių su tarpais priimama (F3)', async () => {
    noDuplicates()
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 1 }])

    const { res } = await run({ entries: [entry({ name: ` ${'a'.repeat(50)} ` })] })

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it.each([
    ['3abc', 3],
    ['2.5', 2],
  ])('kreditai „%s“ priimami kaip %i (parseInt, F1)', async (credits, expected) => {
    noDuplicates()
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 1 }])

    const { res } = await run({ entries: [entry({ credits })] })

    expect(res.status).toHaveBeenCalledWith(201)
    expect(mockPoolQuery).toHaveBeenLastCalledWith(expect.any(String), [[[USER_ID, 'Dirbtinis intelektas', expected, null]]])
  })

  it('aprašymo ilgis netikrinamas: 3000 simbolių aprašymas išsaugomas (F2)', async () => {
    noDuplicates()
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 1 }])

    const { res } = await run({ entries: [entry({ description: 'a'.repeat(3000) })] })

    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('klaidos pranešime pavadinimas rodomas neapkarpytas', async () => {
    const { res } = await run({ entries: [entry({ name: ' AI ', credits: '' })] })

    expect(res.json).toHaveBeenCalledWith({ error: 'Kreditai privalomi: " AI "' })
  })

  it('kai įrašas neturi pavadinimo lauko – klaida perduodama next', async () => {
    const { res, next } = await run({ entries: [{ credits: '6' }] })

    expect(next).toHaveBeenCalledWith(expect.any(TypeError))
    expect(res.status).not.toHaveBeenCalled()
  })
})
