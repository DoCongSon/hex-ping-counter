import { describe, it, beforeAll, expect, vi } from 'vitest'
import express from 'express'

import request from 'supertest'
import { buildAuthController } from './auth.controller'

// Mock AuthServicePort
const mockService = {
  login: vi.fn().mockResolvedValue('mock-token'),
  register: vi.fn().mockResolvedValue({ id: '1', email: 'test@email.com', username: 'testuser' }),
  changePassword: vi.fn().mockResolvedValue(undefined),
  changeUserInfo: vi.fn().mockResolvedValue(undefined),
}

// Mock authMiddleware
const mockAuthMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.user = { userId: '1', userEmail: 'test@email.com', username: 'testuser' }
  next()
}

describe('AuthController Integration', () => {
  let app: express.Express

  beforeAll(() => {
    app = express()
    app.use(express.json())
    app.use('/auth', buildAuthController(mockService, mockAuthMiddleware))
  })

  it('POST /auth/login - success', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'test@email.com', password: '123456' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBe('mock-token')
  })

  it('POST /auth/register - success', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'test@email.com', password: '123456', username: 'testuser' })
    expect(res.status).toBe(201)
    expect(res.body.user.email).toBe('test@email.com')
  })

  it('PUT /auth/password - success', async () => {
    const res = await request(app).put('/auth/password').send({ oldPassword: '123456', newPassword: '654321' })
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Password changed successfully')
  })

  it('GET /auth/profile - success', async () => {
    const res = await request(app).get('/auth/profile')
    expect(res.status).toBe(200)
    expect(res.body.userId).toBe('1')
  })

  it('PATCH /auth/profile - success', async () => {
    const res = await request(app).patch('/auth/profile').send({ username: 'newname' })
    expect(res.status).toBe(200)
    expect(res.body.message).toBe('Profile updated successfully')
  })
})
