import { jest, describe, test, expect, beforeEach } from '@jest/globals'

// ── DB mock ───────────────────────────────────────────────────────────────────
const mockExecute = jest.fn()
const mockGetConnection = jest.fn()
const mockBeginTransaction = jest.fn()
const mockConnExecute = jest.fn()
const mockQuery = jest.fn()
const mockCommit = jest.fn()
const mockRollback = jest.fn()
const mockRelease = jest.fn()

const mockConn = {
  beginTransaction: mockBeginTransaction,
  execute: mockConnExecute,
  query: mockQuery,
  commit: mockCommit,
  rollback: mockRollback,
  release: mockRelease,
}

await jest.unstable_mockModule('../src/config/database.js', () => ({
  default: { execute: mockExecute, getConnection: mockGetConnection },
}))

const { getDominantSubjects, saveDominantSubjects } = await import('../src/modules/users/users.service.js')

beforeEach(() => {
  jest.clearAllMocks()
  mockGetConnection.mockResolvedValue(mockConn)
  mockBeginTransaction.mockResolvedValue()
  mockCommit.mockResolvedValue()
  mockRollback.mockResolvedValue()
  mockRelease.mockResolvedValue()
})

// ── getDominantSubjects ───────────────────────────────────────────────────────

describe('SCRUM-73: getDominantSubjects', () => {
  test('AC#3: grąžina išsaugotų dalykų ID masyvą', async () => {
    mockExecute.mockResolvedValue([[{ subject_id: 1 }, { subject_id: 5 }, { subject_id: 12 }]])

    const result = await getDominantSubjects(42)

    expect(mockExecute).toHaveBeenCalledWith(
      expect.stringContaining('SELECT subject_id FROM user_dominant_subjects'),
      [42]
    )
    expect(result).toEqual([1, 5, 12])
  })

  test('AC#3: grąžina tuščią masyvą kai vartotojas neturi išsaugotų dalykų', async () => {
    mockExecute.mockResolvedValue([[]])

    const result = await getDominantSubjects(99)

    expect(result).toEqual([])
  })
})

// ── saveDominantSubjects ──────────────────────────────────────────────────────

describe('SCRUM-73: saveDominantSubjects', () => {
  test('AC#3: išsaugo dalykus – DELETE + INSERT transakcijoje', async () => {
    mockConnExecute.mockResolvedValue([{}])
    mockQuery.mockResolvedValue([{}])

    await saveDominantSubjects(1, [10, 20, 30])

    expect(mockBeginTransaction).toHaveBeenCalled()
    expect(mockConnExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM user_dominant_subjects'),
      [1]
    )
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO user_dominant_subjects'),
      [[[1, 10], [1, 20], [1, 30]]]
    )
    expect(mockCommit).toHaveBeenCalled()
    expect(mockRelease).toHaveBeenCalled()
  })

  test('AC#3: dalykų įrašai susieti su vartotojo ID', async () => {
    mockConnExecute.mockResolvedValue([{}])
    mockQuery.mockResolvedValue([{}])

    await saveDominantSubjects(42, [5, 7])

    expect(mockConnExecute).toHaveBeenCalledWith(expect.any(String), [42])
    expect(mockQuery).toHaveBeenCalledWith(expect.any(String), [[[42, 5], [42, 7]]])
  })

  test('AC#3: kai sąrašas tuščias – tik DELETE, INSERT nevykdomas', async () => {
    mockConnExecute.mockResolvedValue([{}])

    await saveDominantSubjects(1, [])

    expect(mockConnExecute).toHaveBeenCalledWith(
      expect.stringContaining('DELETE'),
      [1]
    )
    expect(mockQuery).not.toHaveBeenCalled()
    expect(mockCommit).toHaveBeenCalled()
  })

  test('DB klaida: rollback iškviečiamas ir klaida perduodama toliau', async () => {
    mockConnExecute.mockRejectedValue(new Error('DB jungtis nutrūko'))

    await expect(saveDominantSubjects(1, [10])).rejects.toThrow('DB jungtis nutrūko')

    expect(mockRollback).toHaveBeenCalled()
    expect(mockRelease).toHaveBeenCalled()
  })
})
