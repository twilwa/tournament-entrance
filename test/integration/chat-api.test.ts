import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createTestServer, startTestServer, stopTestServer, createTestRequest } from '../helpers/test-server'

describe('Chat API Integration', () => {
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

  describe('POST /api/chat', () => {
    it('should respond to chat messages with real AI', async () => {
      const response = await createTestRequest(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: 'Hello Stallman, what is free software?' }]
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('choices')
      expect(response.body.choices[0]).toHaveProperty('message')
      expect(response.body.choices[0].message).toHaveProperty('content')
      expect(typeof response.body.choices[0].message.content).toBe('string')
      expect(response.body.choices[0].message.content.length).toBeGreaterThan(0)
    }, 30000)

    it('should handle empty messages', async () => {
      const response = await createTestRequest(app)
        .post('/api/chat')
        .send({
          messages: []
        })

      expect(response.status).toBe(400)
    })

    it('should handle different languages', async () => {
      const response = await createTestRequest(app)
        .post('/api/chat')
        .send({
          messages: [{ role: 'user', content: 'Hola Stallman, ¿qué es el software libre?' }]
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('choices')
      expect(response.body.choices[0]).toHaveProperty('message')
      expect(response.body.choices[0].message).toHaveProperty('content')
      expect(typeof response.body.choices[0].message.content).toBe('string')
      expect(response.body.choices[0].message.content.length).toBeGreaterThan(0)
    }, 30000)
  })

  describe('POST /api/chat/stream', () => {
    it('should stream chat responses', async () => {
      const response = await createTestRequest(app)
        .post('/api/chat/stream')
        .send({
          messages: [{ role: 'user', content: 'Hello Stallman' }]
        })

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toBe('text/event-stream')
      expect(response.text).toContain('data:')
    }, 30000)

    it('should handle streaming errors gracefully', async () => {
      const response = await createTestRequest(app)
        .post('/api/chat/stream')
        .send({
          messages: []
        })

      expect(response.status).toBe(400)
    })
  })
})
