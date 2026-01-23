import { describe, it, expect, vi, beforeAll } from 'vitest'
import express from 'express'
import request from 'supertest'
import { createAuthMiddleware } from './auth.middleware'

// Mock TokenGeneratorPort
const mockTokenGenerator = {
  verify: vi.fn(),
  generate: vi.fn(),
}

describe('Auth Middleware', () => {
  let app: express.Express

  beforeAll(() => {
    app = express()
    app.use(express.json())
    // Test route
    app.get('/protected', createAuthMiddleware(mockTokenGenerator), (req, res) => {
      res.json({ user: req.user })
    })
    // Custom error handler
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      res.status(401).json({ error: err.message || 'Unauthorized' })
    })
  })

  it('should return user when token is valid', async () => {
    mockTokenGenerator.verify.mockReturnValue({
      sub: '123',
      email: 'test@email.com',
      username: 'tester',
    })
    const res = await request(app).get('/protected').set('Authorization', 'Bearer validtoken')
    expect(res.status).toBe(200)
    expect(res.body.user).toMatchObject({
      userId: '123',
      userEmail: 'test@email.com',
      username: 'tester',
    })
  })

  it('should return error when authorization header is missing', async () => {
    const res = await request(app).get('/protected')
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('should return error when authorization header is malformed', async () => {
    const res = await request(app).get('/protected').set('Authorization', 'Token something')
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })

  it('should return error when token is invalid', async () => {
    mockTokenGenerator.verify.mockReturnValue(undefined)
    const res = await request(app).get('/protected').set('Authorization', 'Bearer invalidtoken')
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })
})
