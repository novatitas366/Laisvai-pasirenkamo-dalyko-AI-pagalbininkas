import { jest } from '@jest/globals'

// Mocking fs/promises
const mockReadFile = jest.fn()
const mockWriteFile = jest.fn()

jest.unstable_mockModule('fs/promises', () => ({
  default: {
    readFile: mockReadFile,
    writeFile: mockWriteFile
  },
  readFile: mockReadFile,
  writeFile: mockWriteFile
}))

// Dynamically import service
const conversationsService = await import('./conversations.service.js')

describe('SCRUM-78: Conversations Service tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('getConversations should return [] and log error when fs fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockReadFile.mockRejectedValue(new Error('Read fail'))
    
    const result = await conversationsService.getConversations()
    
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error reading conversations:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  test('getConversations should return parsed data', async () => {
    const mockData = [
      { id: '1', title: 'Senas', date: '2025-01-01' },
      { id: '2', title: 'Naujas', date: '2025-03-01' }
    ]
    mockReadFile.mockResolvedValue(JSON.stringify(mockData))
    
    const result = await conversationsService.getConversations()
    expect(result).toEqual(mockData)
    // Užtikriname, kad jei failas būtų surūšiuotas, mes tai gautume
    expect(result[0].id).toBe('1')
  })

  test('getMessagesByConversationId should return messages or null', async () => {
    const mockData = { '1': [{ role: 'user', content: 'test' }] }
    mockReadFile.mockResolvedValue(JSON.stringify(mockData))
    
    const result = await conversationsService.getMessagesByConversationId('1')
    expect(result).toEqual(mockData['1'])
    
    const result2 = await conversationsService.getMessagesByConversationId('999')
    expect(result2).toBeNull()
  })

  test('getMessagesByConversationId should return null and log error when fs fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockReadFile.mockRejectedValue(new Error('Read fail'))
    
    const result = await conversationsService.getMessagesByConversationId('1')
    
    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith('Error reading messages:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  test('renameConversation should rename and truncate to 100 chars', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify([{ id: '1', title: 'Old' }]))
    mockWriteFile.mockResolvedValue(undefined)
    
    const result = await conversationsService.renameConversation('1', 'A'.repeat(101))
    
    expect(result.title.length).toBe(100)
    expect(mockWriteFile).toHaveBeenCalled()
  })

  test('renameConversation should return null for missing id', async () => {
    mockReadFile.mockResolvedValue(JSON.stringify([{ id: '1', title: 'Old' }]))
    const result = await conversationsService.renameConversation('999', 'New')
    expect(result).toBeNull()
  })

  test('renameConversation should throw error and log when fs fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockReadFile.mockResolvedValue(JSON.stringify([{ id: '1', title: 'Old' }]))
    mockWriteFile.mockRejectedValue(new Error('Write fail'))
    
    await expect(conversationsService.renameConversation('1', 'New')).rejects.toThrow('Write fail')
    expect(consoleSpy).toHaveBeenCalledWith('Error renaming conversation:', expect.any(Error))
    consoleSpy.mockRestore()
  })
})
