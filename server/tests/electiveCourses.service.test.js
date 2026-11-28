import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const mockPoolQuery = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: {
    query: mockPoolQuery,
    execute: jest.fn(),
  },
}))

const { NAME_MAX, validateElectives, findExistingElective, insertElectives } =
  await import('../src/services/electiveCourses.service.js')

const USER_ID = 7

const entry = (overrides = {}) => ({ name: 'Dirbtinis intelektas', credits: '6', description: '', ...overrides })

beforeEach(() => {
  jest.clearAllMocks()
})

describe('validateElectives', () => {
  it('NAME_MAX yra 50', () => {
    expect(NAME_MAX).toBe(50)
  })

  it.each([undefined, null, 'tekstas', []])('kai entries %p – „Nėra duomenų išsaugojimui“', (entries) => {
    expect(validateElectives(entries)).toEqual({ error: 'Nėra duomenų išsaugojimui' })
  })

  it('kai visi pavadinimai tušti – „Nėra galiojančių duomenų išsaugojimui“', () => {
    expect(validateElectives([entry({ name: '' }), entry({ name: '  ' })])).toEqual({
      error: 'Nėra galiojančių duomenų išsaugojimui',
    })
  })

  it('teisingi duomenys – grąžinami įrašai be tuščių pavadinimų', () => {
    const valid = entry()
    expect(validateElectives([entry({ name: '' }), valid])).toEqual({ entries: [valid] })
  })

  it('pavadinimas ilgesnis nei 50 (su trim) – klaida su pirmais 20 simbolių', () => {
    const name = `${'a'.repeat(20)}${'b'.repeat(31)}`
    expect(validateElectives([entry({ name })])).toEqual({
      error: `Pavadinimas per ilgas (maks. 50 simbolių): "${'a'.repeat(20)}..."`,
    })
  })

  it('50 simbolių pavadinimas su tarpais kraštuose priimamas', () => {
    expect(validateElectives([entry({ name: ` ${'a'.repeat(50)} ` })]).error).toBeUndefined()
  })

  it.each(['', null, undefined])('kreditai %p – „Kreditai privalomi“', (credits) => {
    expect(validateElectives([entry({ credits })])).toEqual({ error: 'Kreditai privalomi: "Dirbtinis intelektas"' })
  })

  it.each(['0', '-1', 'abc'])('kreditai „%s“ – „Kreditai turi būti teigiamas skaičius“', (credits) => {
    expect(validateElectives([entry({ credits })])).toEqual({
      error: 'Kreditai turi būti teigiamas skaičius: "Dirbtinis intelektas"',
    })
  })

  it.each(['3abc', '2.5', 6])('kreditai %p priimami (parseInt)', (credits) => {
    expect(validateElectives([entry({ credits })]).error).toBeUndefined()
  })

  it('pavadinimų ilgis tikrinamas visiems įrašams prieš kreditus', () => {
    const result = validateElectives([entry({ credits: '' }), entry({ name: 'a'.repeat(51) })])
    expect(result.error).toMatch(/^Pavadinimas per ilgas/)
  })

  it('grąžinama pirmo įrašo su klaidingais kreditais klaida', () => {
    const result = validateElectives([entry({ name: 'A', credits: '0' }), entry({ name: 'B', credits: '' })])
    expect(result).toEqual({ error: 'Kreditai turi būti teigiamas skaičius: "A"' })
  })

  it('kai įrašas neturi pavadinimo lauko – išmeta TypeError', () => {
    expect(() => validateElectives([{ credits: '6' }])).toThrow(TypeError)
  })
})

describe('findExistingElective', () => {
  it('kai dublikatų nėra – grąžina null ir tikrina kiekvieną įrašą', async () => {
    mockPoolQuery.mockResolvedValue([[]])

    const result = await findExistingElective(USER_ID, [entry({ name: ' AI ' }), entry({ name: 'ML', credits: '3abc' })])

    expect(result).toBeNull()
    expect(mockPoolQuery).toHaveBeenNthCalledWith(
      1,
      'SELECT id FROM user_elective_courses WHERE user_id = ? AND LOWER(name) = LOWER(?) AND credits = ?',
      [USER_ID, 'AI', 6]
    )
    expect(mockPoolQuery).toHaveBeenNthCalledWith(2, expect.any(String), [USER_ID, 'ML', 3])
  })

  it('radus dublikatą – grąžina neapkarpytą pavadinimą ir kreditus, toliau neieško', async () => {
    mockPoolQuery.mockResolvedValueOnce([[{ id: 1 }]])

    const result = await findExistingElective(USER_ID, [entry({ name: ' AI ' }), entry({ name: 'ML' })])

    expect(result).toEqual({ name: ' AI ', credits: 6 })
    expect(mockPoolQuery).toHaveBeenCalledTimes(1)
  })
})

describe('insertElectives', () => {
  it('įrašo visus įrašus vienu INSERT ir grąžina įrašytų skaičių', async () => {
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 2 }])

    const count = await insertElectives(USER_ID, [
      entry({ name: ' AI ', description: ' Aprašymas ' }),
      entry({ name: 'ML', credits: 5, description: undefined }),
    ])

    expect(count).toBe(2)
    expect(mockPoolQuery).toHaveBeenCalledWith(
      'INSERT INTO user_elective_courses (user_id, name, credits, description) VALUES ?',
      [[
        [USER_ID, 'AI', 6, 'Aprašymas'],
        [USER_ID, 'ML', 5, null],
      ]]
    )
  })

  it.each(['abc', '0'])('neteisingi kreditai „%s“ įrašomi kaip null', async (credits) => {
    mockPoolQuery.mockResolvedValueOnce([{ affectedRows: 1 }])

    await insertElectives(USER_ID, [entry({ credits })])

    expect(mockPoolQuery).toHaveBeenCalledWith(expect.any(String), [[[USER_ID, 'Dirbtinis intelektas', null, null]]])
  })
})
