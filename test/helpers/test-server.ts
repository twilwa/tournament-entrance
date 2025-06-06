import express from 'express'
import request from 'supertest'
import { createServer } from 'http'
import { registerRoutes } from '../../server/routes'

export async function createTestServer() {
  const app = express()
  app.use(express.json())
  app.use(express.urlencoded({ extended: false }))
  
  // Use real server routes
  await registerRoutes(app)
  
  return app
}

export function startTestServer(app: express.Application, port = 0) {
  return new Promise<{ server: any; port: number }>((resolve) => {
    const server = createServer(app)
    server.listen(port, () => {
      const address = server.address()
      const actualPort = typeof address === 'object' && address ? address.port : port
      resolve({ server, port: actualPort })
    })
  })
}

export function stopTestServer(server: any) {
  return new Promise<void>((resolve) => {
    server.close(() => resolve())
  })
}

export function createTestRequest(app: express.Application) {
  return request(app)
}
