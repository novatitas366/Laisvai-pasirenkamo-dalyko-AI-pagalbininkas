import { jest, describe, test, expect, beforeEach } from '@jest/globals'

const mockExecute = jest.fn()

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { execute: (...args) => mockExecute(...args) },
}))

const { getProfile, saveProfile } = await import('../src/modules/profile/profile.service.js')

beforeEach(() => {
  jest.clearAllMocks()
})

describe('profile.service', () => {
  describe('getProfile', () => {
    test('grąžina profilio duomenis kai įrašas egzistuoja', async () => {
      const row = { university_id: 1, university_name: 'VDU', study_program_id: 2, study_program_name: 'Informatika' }
      mockExecute.mockResolvedValueOnce([[row]])

      const result = await getProfile(42)

      expect(result).toEqual(row)
      expect(mockExecute).toHaveBeenCalledWith(expect.stringContaining('user_profiles'), [42])
    })

    test('grąžina null kai profilis nerastas', async () => {
      mockExecute.mockResolvedValueOnce([[]])

      const result = await getProfile(99)

      expect(result).toBeNull()
    })
  })

  describe('saveProfile', () => {
    test('atnaujina esamą profilį (UPDATE) ir grąžina išsaugotus duomenis', async () => {
      const saved = { university_id: 1, university_name: 'VDU', study_program_id: 2, study_program_name: 'Informatika' }
      mockExecute
        .mockResolvedValueOnce([[{ id: 1 }]])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([[saved]])

      const result = await saveProfile(1, 1, 2)

      expect(mockExecute).toHaveBeenNthCalledWith(2, expect.stringContaining('UPDATE'), [1, 2, 1])
      expect(result).toEqual(saved)
    })

    test('sukuria naują profilį (INSERT) kai įrašo nėra', async () => {
      const saved = { university_id: 3, university_name: 'KTU', study_program_id: 5, study_program_name: 'Programų sistemos' }
      mockExecute
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([[saved]])

      const result = await saveProfile(7, 3, 5)

      expect(mockExecute).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT'), [7, 3, 5])
      expect(result).toEqual(saved)
    })

    test('išsaugo null reikšmes kai universityId ir studyProgramId nepateikti', async () => {
      mockExecute
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{}])
        .mockResolvedValueOnce([[]])

      await saveProfile(10, undefined, undefined)

      expect(mockExecute).toHaveBeenNthCalledWith(2, expect.stringContaining('INSERT'), [10, null, null])
    })
  })
})
