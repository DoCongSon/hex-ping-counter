import express from 'express'
import { PingCounterServicePort } from '../../../core/ports/driving/ping-counter.service.port'
import { IncrementFailedError } from '../../../core/domain/ping-counter.entity'
import { HistoryCounterServicePort } from '../../../core/ports/driving/history-counter.service.port'

export function buildPingCounterRouter(service: PingCounterServicePort, historyService: HistoryCounterServicePort) {
  const router = express.Router()

  router.get('/ping', async (req, res) => {
    try {
      const counter = await service.getCurrentPingCounter()
      res.json({ id: counter.id, count: counter.count })
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  })
  router.post('/ping', async (req, res) => {
    try {
      const counter = await service.incrementPingCounter()
      res.json({ id: counter.id, count: counter.count })
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
      res.json({ id: counter.id, count: counter.count })
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  })

  router.get('/history', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined
      const history = await historyService.getHistory(limit)

      res.json({
        history: history.map((h) => ({
          counterId: h.id,
          action: h.action,
          timestamp: h.timestamp,
        })),
      })
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  })

  return router
}
