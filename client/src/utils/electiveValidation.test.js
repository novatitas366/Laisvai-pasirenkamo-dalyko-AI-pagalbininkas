import { describe, it, expect } from '@jest/globals'
import {
  NAME_MAX,
  DESC_MAX,
  normalizeName,
  validateField,
  validateEntry,
} from './electiveValidation.js'

const validEntry = (overrides = {}) => ({
  name: 'Dirbtinis intelektas',
  credits: '6',
  description: '',
  ...overrides,
})

describe('konstantos', () => {
  it('NAME_MAX yra 50, DESC_MAX yra 2000', () => {
    expect(NAME_MAX).toBe(50)
    expect(DESC_MAX).toBe(2000)
  })
})

describe('normalizeName', () => {
  it('pašalina tarpus kraštuose ir paverčia mažosiomis raidėmis', () => {
    expect(normalizeName('  Dirbtinis INTELEKTAS ')).toBe('dirbtinis intelektas')
  })
})

describe('validateField', () => {
  it('priima 50 simbolių pavadinimą', () => {
    expect(validateField('name', 'a'.repeat(50))).toBe('')
  })

  it('atmeta 51 simbolio pavadinimą', () => {
    expect(validateField('name', 'a'.repeat(51))).toBe('Pavadinimas negali viršyti 50 simbolių')
  })

  it('pavadinimo ilgį skaičiuoja be trim', () => {
    expect(validateField('name', ` ${'a'.repeat(50)}`)).toBe('Pavadinimas negali viršyti 50 simbolių')
  })

  it('priima 2000 simbolių aprašymą', () => {
    expect(validateField('description', 'a'.repeat(2000))).toBe('')
  })

  it('atmeta 2001 simbolio aprašymą', () => {
    expect(validateField('description', 'a'.repeat(2001))).toBe('Aprašymas negali viršyti 2000 simbolių')
  })

  it('tušti kreditai rašant nelaikomi klaida', () => {
    expect(validateField('credits', '')).toBe('')
  })

  it.each(['0', '-1', 'abc'])('atmeta kreditus „%s“', (value) => {
    expect(validateField('credits', value)).toBe('Kreditai turi būti teigiamas skaičius')
  })

  it.each(['6', '2.5'])('priima kreditus „%s“', (value) => {
    expect(validateField('credits', value)).toBe('')
  })

  it('kitų laukų netikrina', () => {
    expect(validateField('other', 'a'.repeat(3000))).toBe('')
  })
})

describe('validateEntry', () => {
  it('teisingas įrašas – tuščia reikšmė', () => {
    expect(validateEntry(validEntry(), new Set())).toBe('')
  })

  it('tuščias arba tik tarpų pavadinimas – „Pavadinimas privalomas“', () => {
    expect(validateEntry(validEntry({ name: '   ' }), new Set())).toBe('Pavadinimas privalomas')
  })

  it('pavadinimas ilgesnis nei 50 – „Pavadinimas per ilgas (maks. 50)“', () => {
    expect(validateEntry(validEntry({ name: 'a'.repeat(51) }), new Set())).toBe('Pavadinimas per ilgas (maks. 50)')
  })

  it('aprašymas ilgesnis nei 2000 – „Aprašymas per ilgas (maks. 2000)“', () => {
    expect(validateEntry(validEntry({ description: 'a'.repeat(2001) }), new Set())).toBe(
      'Aprašymas per ilgas (maks. 2000)'
    )
  })

  it.each(['', null, undefined])('kreditai %p – „Kreditai privalomi“', (credits) => {
    expect(validateEntry(validEntry({ credits }), new Set())).toBe('Kreditai privalomi')
  })

  it.each(['0', '-1', 'abc'])('kreditai „%s“ – „Kreditai turi būti teigiamas skaičius“', (credits) => {
    expect(validateEntry(validEntry({ credits }), new Set())).toBe('Kreditai turi būti teigiamas skaičius')
  })

  it('pavadinimas jau yra sąraše – „Šis pavadinimas jau naudojamas sąraše“', () => {
    const seenNames = new Set(['dirbtinis intelektas'])
    expect(validateEntry(validEntry({ name: ' Dirbtinis Intelektas ' }), seenNames)).toBe(
      'Šis pavadinimas jau naudojamas sąraše'
    )
  })

  it('taisyklės tikrinamos nustatyta tvarka – grąžinama pirmoji klaida', () => {
    const entry = { name: 'a'.repeat(51), credits: '', description: 'a'.repeat(2001) }
    expect(validateEntry(entry, new Set())).toBe('Pavadinimas per ilgas (maks. 50)')
  })

  it('nekeičia perduoto pavadinimų rinkinio', () => {
    const seenNames = new Set()
    validateEntry(validEntry(), seenNames)
    expect(seenNames.size).toBe(0)
  })
})
