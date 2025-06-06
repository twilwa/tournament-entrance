import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import express from 'express'
import request from 'supertest'

describe('Basic Server', () => {
  let app: express.Application

  beforeAll(() => {
    app = express()
    app.use(express.json())
    
    // Simple test endpoint
    app.get('/test', (req, res) => {
      res.json({ message: 'Server is working' })
    })
  })

  it('should respond to test endpoint', async () => {
    const response = await request(app)
      .get('/test')
      .expect(200)

    expect(response.body.message).toBe('Server is working')
  })
})
