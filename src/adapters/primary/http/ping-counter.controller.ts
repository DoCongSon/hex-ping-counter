import { NextFunction, Request, Response, Router } from 'express'
import { PingCounterServicePort } from '../../../core/ports/driving/ping-counter.service.port'
import { UnauthorizedError } from './error-handler'

export function buildPingCounterRouter(service: PingCounterServicePort) {
  const router = Router()

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        next(new UnauthorizedError())
        return
      }
      const counter = await service.getCurrentPingCounter(userId)
      res.json(counter)
    } catch (error) {
      next(error)
    }
  })
  router.post('/', async (req, res, next: NextFunction) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        next(new UnauthorizedError())
        return
      }
      const counter = await service.incrementPingCounter(userId)
      res.json(counter)
    } catch (error) {
      next(error)
    }
  })
  router.post('/reset', async (req, res, next: NextFunction) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        next(new UnauthorizedError())
        return
      }
      const counter = await service.resetPingCounter(userId)
      res.json(counter)
    } catch (error) {
      next(error)
    }
  })
  return router
}
