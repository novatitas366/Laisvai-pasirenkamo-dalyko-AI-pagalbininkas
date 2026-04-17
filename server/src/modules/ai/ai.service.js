import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserMessage } from './prompts.js'

const client = new Anthropic()

const RECOMMENDATION_TOOL = {
  name: 'save_recommendation',
  description: 'Iškviesti kai pateiki galutinę rekomendaciją studentui. Naudok tik tada, kai esi pasiruošęs pateikti konkrečius rekomenduojamus dalykus.',
  input_schema: {
    type: 'object',
    properties: {
      subjects: {
        type: 'array',
        items: { type: 'string' },
        description: 'Rekomenduojamų dalykų pavadinimai',
      },
      explanations: {
        type: 'array',
        items: { type: 'string' },
        description: 'Kiekvieno dalyko paaiškinimas kodėl jis tinka šiam studentui',
      },
    },
    required: ['subjects', 'explanations'],
  },
}

export async function getChatResponse(systemPrompt, messages) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: messages.map(m => ({
      role: m.role,
      content: m.text || m.content || '',
    })),
    tools: [RECOMMENDATION_TOOL],
    tool_choice: { type: 'auto' },
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''
  const toolUse = response.content.find(b => b.type === 'tool_use' && b.name === 'save_recommendation')
  const recommendation = toolUse?.input ?? null

  return { text, recommendation }
}

export async function getRecommendation(context) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: buildUserMessage(context),
      },
    ],
  })

  const text = response.content.find(b => b.type === 'text')?.text ?? ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('AI negrąžino tinkamo atsakymo formato')
  }

  const result = JSON.parse(jsonMatch[0])

  if (!result.recommendedSubject || !result.explanation) {
    throw new Error('AI atsakyme trūksta laukų')
  }

  return result
}
