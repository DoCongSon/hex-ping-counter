import { describe, it, beforeAll, expect, vi } from 'vitest'
import express from 'express'
import request from 'supertest'
import { buildPingCounterRouter } from './ping-counter.controller'

// Mock PingCounterServicePort
const mockService = {
  getCurrentPingCounter: vi.fn().mockResolvedValue({ count: 5 }),
  incrementPingCounter: vi.fn().mockResolvedValue({ count: 6 }),
  resetPingCounter: vi.fn().mockResolvedValue({ count: 0 }),
}

// Middleware giả lập user đã đăng nhập
const mockAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  req.user = { userId: '1', userEmail: 'abc@example.com', username: 'testuser' }
  next()
}

describe('PingCounterController Integration', () => {
  let app: express.Express

  beforeAll(() => {
    app = express()
    app.use(express.json())
    // Gắn middleware giả lập user cho tất cả route
    app.use(mockAuth)
    app.use('/ping', buildPingCounterRouter(mockService))
  })

  it('GET /ping - trả về count hiện tại', async () => {
    const res = await request(app).get('/ping')
    expect(res.status).toBe(200)
    expect(res.body.count).toBe(5)
  })

  it('POST /ping - tăng count', async () => {
    const res = await request(app).post('/ping')
    expect(res.status).toBe(200)
    expect(res.body.count).toBe(6)
  })

  it('POST /ping/reset - reset count', async () => {
    const res = await request(app).post('/ping/reset')
    expect(res.status).toBe(200)
    expect(res.body.count).toBe(0)
  })
})
