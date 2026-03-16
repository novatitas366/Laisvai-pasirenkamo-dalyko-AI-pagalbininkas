import { jest } from '@jest/globals'

// Mock the service module
const mockGetConversations = jest.fn()
const mockGetMessages = jest.fn()
const mockRename = jest.fn()

jest.unstable_mockModule('./conversations.service.js', () => ({
  getConversations: mockGetConversations,
  getMessagesByConversationId: mockGetMessages,
  renameConversation: mockRename
}))

// Dynamically import controller
const conversationsController = await import('./conversations.controller.js')

describe('SCRUM-78: Conversations Controller tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('list should return json and 200', async () => {
    const mockData = [{ id: '1' }]
    mockGetConversations.mockResolvedValue(mockData)
    
    const req = {}
    const res = { json: jest.fn() }
    const next = jest.fn()

    await conversationsController.list(req, res, next)
    expect(res.json).toHaveBeenCalledWith(mockData)
  })

  test('list should call next on error', async () => {
    mockGetConversations.mockRejectedValue(new Error('Fail'))
    const req = {}
    const res = { json: jest.fn() }
    const next = jest.fn()

    await conversationsController.list(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('getMessages should return json or 404', async () => {
    mockGetMessages.mockResolvedValue([{ content: 'hi' }])
    const req = { params: { id: '1' } }
    const res = { json: jest.fn() }
    const next = jest.fn()

    await conversationsController.getMessages(req, res, next)
    expect(res.json).toHaveBeenCalled()

    mockGetMessages.mockResolvedValue(null)
    const res404 = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    await conversationsController.getMessages(req, res404, next)
    expect(res404.status).toHaveBeenCalledWith(404)
  })

  test('rename should validate title', async () => {
    const req = { params: { id: '1' }, body: { title: '' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await conversationsController.rename(req, res, next)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  test('rename should return 200 and updated conversation', async () => {
    const mockUpdated = { id: '1', title: 'New' }
    mockRename.mockResolvedValue(mockUpdated)
    const req = { params: { id: '1' }, body: { title: 'New' } }
    const res = { json: jest.fn() }
    const next = jest.fn()

    await conversationsController.rename(req, res, next)
    expect(res.json).toHaveBeenCalledWith(mockUpdated)
  })

  test('rename should return 404 if not found', async () => {
    mockRename.mockResolvedValue(null)
    const req = { params: { id: '999' }, body: { title: 'New' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await conversationsController.rename(req, res, next)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('rename should call next on service error', async () => {
    mockRename.mockRejectedValue(new Error('Fail'))
    const req = { params: { id: '1' }, body: { title: 'New' } }
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    const next = jest.fn()

    await conversationsController.rename(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
