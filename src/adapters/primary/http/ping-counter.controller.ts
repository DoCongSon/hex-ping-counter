import express from 'express'
import { PingCounterServicePort } from '../../../core/ports/driving/ping-counter.service.port'
import { IncrementFailedError } from '../../../core/domain/ping-counter.entity'

export function buildPingCounterRouter(service: PingCounterServicePort) {
  const router = express.Router()

  router.get('/ping', async (req, res) => {
    try {
      const counter = await service.getCurrentPingCounter()
      res.json(counter)
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  })
  router.post('/ping', async (req, res) => {
    try {
      const counter = await service.incrementPingCounter()
      res.json(counter)
    } catch (error) {
      if (error instanceof IncrementFailedError) {
        return res.status(409).json({ error: error.message })
      }
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  })
  router.post('/reset', async (req, res) => {
    try {
      const counter = await service.resetPingCounter()
      res.json(counter)
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  })
  return router
}
