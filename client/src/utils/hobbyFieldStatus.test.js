/**
 * Vienetų testai: getFieldStatus (client/src/utils/hobbyFieldStatus.js)
 * ND2, Studentas 2, A2. Grynoji funkcija, iškelta iš HobbyEntry komponento –
 * testuojama be React ir naršyklės aplinkos.
 */
import { getFieldStatus, FIELD_STATUS } from './hobbyFieldStatus'

const MAX = 20

describe('getFieldStatus', () => {
  it.each([
    ['tuščias laukas', '', FIELD_STATUS.OK],
    ['tik tarpai (po trim tuščias)', '   ', FIELD_STATUS.OK],
    ['1 simbolis', 'a', FIELD_STATUS.SHORT],
    ['3 simboliai – vienu mažiau už minimumą', 'abc', FIELD_STATUS.SHORT],
    ['3 simboliai su tarpais aplink', '  abc  ', FIELD_STATUS.SHORT],
    ['lygiai minimumas (4)', 'abcd', FIELD_STATUS.OK],
    ['lygiai maksimumas (20)', 'a'.repeat(20), FIELD_STATUS.OK],
    ['vienu daugiau už maksimumą (21)', 'a'.repeat(21), FIELD_STATUS.ERROR],
  ])('%s → %s', (_, value, expected) => {
    expect(getFieldStatus(value, MAX)).toBe(expected)
  })

  it('per ilgas tikrinamas pirmiau nei per trumpas (ilgis be trim)', () => {
    expect(getFieldStatus(' ab' + ' '.repeat(18), MAX)).toBe(FIELD_STATUS.ERROR)
  })

  it('maksimumas imamas iš parametro (aprašymui 150)', () => {
    expect(getFieldStatus('a'.repeat(150), 150)).toBe(FIELD_STATUS.OK)
    expect(getFieldStatus('a'.repeat(151), 150)).toBe(FIELD_STATUS.ERROR)
  })
})
