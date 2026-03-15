import * as conversationsService from './conversations.service.js'

export async function list(req, res, next) {
  try {
    const conversations = await conversationsService.getConversations()
    res.json(conversations)
  } catch (error) {
    next(error)
  }
}

export async function getMessages(req, res, next) {
  try {
    const { id } = req.params
    const messages = await conversationsService.getMessagesByConversationId(id)
    
    if (!messages) {
      return res.status(404).json({ error: 'Pokalbis nerastas' })
    }
    
    res.json(messages)
  } catch (error) {
    next(error)
  }
}
