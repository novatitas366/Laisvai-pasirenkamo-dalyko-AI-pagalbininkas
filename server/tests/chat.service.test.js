/**
 * Vienetų testai: formatRecommendation (server/src/modules/ai/chat.service.js)
 * ND2, Studentas 2, B2. Grynoji funkcija, iškelta iš chat.routes.js
 * handlerio – testuojama be HTTP ir be imituoto AI.
 */
import { describe, it, expect } from '@jest/globals'
import { formatRecommendation } from '../src/modules/ai/chat.service.js'

const recommendation = {
  subjects: ['Dirbtinis intelektas', 'Duomenų bazės'],
  explanations: ['Tinka programuotojui.', 'Naudinga praktikoje.'],
}

describe('formatRecommendation', () => {
  it('be rekomendacijos grąžina tekstą nepakeistą', () => {
    expect(formatRecommendation('Labas', null)).toBe('Labas')
    expect(formatRecommendation('Labas', undefined)).toBe('Labas')
  })

  it('prie teksto prideda dalykų sąrašą naujoje eilutėje', () => {
    expect(formatRecommendation('Pasiūlymai:', recommendation)).toBe(
      'Pasiūlymai:\n**Dirbtinis intelektas** — Tinka programuotojui.\n**Duomenų bazės** — Naudinga praktikoje.'
    )
  })

  it('be teksto grąžina tik sąrašą', () => {
    expect(formatRecommendation('', recommendation)).toBe(
      '**Dirbtinis intelektas** — Tinka programuotojui.\n**Duomenų bazės** — Naudinga praktikoje.'
    )
  })

  it('trūkstamą paaiškinimą pakeičia tuščia eilute', () => {
    const partial = { subjects: ['Algoritmai', 'Tinklai'], explanations: ['Svarbu.'] }
    expect(formatRecommendation('X', partial)).toBe('X\n**Algoritmai** — Svarbu.\n**Tinklai** — ')
  })

  it('tuščias dalykų sąrašas duoda tik tekstą su nauja eilute', () => {
    expect(formatRecommendation('X', { subjects: [], explanations: [] })).toBe('X\n')
  })
})
