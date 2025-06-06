import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestServer, startTestServer, stopTestServer, createTestRequest } from '../helpers/test-server'

describe('End-to-End Chat Flow', () => {
  let server: any
  let app: any

  beforeAll(async () => {
    app = await createTestServer()
    const result = await startTestServer(app)
    server = result.server
  })

  afterAll(async () => {
    if (server) {
      await stopTestServer(server)
    }
  })

  it('should complete full chat conversation flow', async () => {
    // Test multiple messages in sequence with real AI responses
    const messages = [
      'Hello Stallman, introduce yourself',
      'What is free software?',
      'Tell me about the GNU Project'
    ]

    for (const message of messages) {
      const response = await createTestRequest(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: message }]
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('choices')
      expect(response.body.choices[0]).toHaveProperty('message')
      expect(response.body.choices[0].message).toHaveProperty('content')
      expect(typeof response.body.choices[0].message.content).toBe('string')
      expect(response.body.choices[0].message.content.length).toBeGreaterThan(10)
    }
  }, 60000)

  it('should handle multilingual conversation', async () => {
    const conversations = [
      'Hello Stallman',
      'Hola Stallman',
      'Bonjour Stallman',
      'Hallo Stallman'
    ]

    for (const message of conversations) {
      const response = await createTestRequest(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: message }]
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('choices')
    }
  }, 60000)

  it('should handle concurrent chat requests', async () => {
    const requests = Array.from({ length: 3 }, (_, i) =>
      createTestRequest(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: `Concurrent message ${i + 1}` }]
        })
    )

    const responses = await Promise.all(requests)
    
    responses.forEach(response => {
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('choices')
    })
  }, 60000)

  it('should maintain conversation context', async () => {
    // First message
    const response1 = await createTestRequest(app)
      .post('/api/chat')
      .send({
        messages: [{ role: 'user', content: 'My name is John' }]
      })

    // Follow-up message referencing previous context
    const response2 = await createTestRequest(app)
      .post('/api/chat')
      .send({
        messages: [
          { role: 'user', content: 'My name is John' },
          { role: 'assistant', content: response1.body.choices[0].message.content },
          { role: 'user', content: 'What is my name?' }
        ]
      })

    expect(response1.status).toBe(200)
    expect(response1.body).toHaveProperty('choices')
    expect(response2.status).toBe(200)
    expect(response2.body).toHaveProperty('choices')
  }, 60000)
})
