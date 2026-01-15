import express, { RequestHandler } from 'express'
import { AuthServicePort } from '../../../core/ports/driving/auth.service.port'
import { UnauthorizedError } from './error-handler'
import z from 'zod'

export function buildAuthController(service: AuthServicePort, authMiddleware: RequestHandler) {
  const router = express.Router()

  router.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body
      const schema = z.object({
        email: z.string().email(),
        password: z.string(),
      })
      const validated = schema.parse({ email, password })
      const result = await service.login(validated.email, validated.password)
      res.json({
        message: 'Login successful',
        token: result,
      })
    } catch (error) {
      next(error)
    }
  })

  router.post('/register', async (req, res, next) => {
    try {
      const { email, password, username } = req.body
      const schema = z.object({
        username: z.string().min(3),
        email: z.string().email(),
        password: z.string().min(6),
      })
      const validated = schema.parse({ email, password, username })
      const result = await service.register(validated.username, validated.email, validated.password)
      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: result.id,
          email: result.email,
          username: result.username,
        },
      })
    } catch (error) {
      next(error)
    }
  })

  router.put('/password', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        next(new UnauthorizedError())
        return
      }
      const schema = z.object({
        oldPassword: z.string().min(6),
        newPassword: z.string().min(6),
      })
      const { oldPassword, newPassword } = req.body
      const validated = schema.parse({ oldPassword, newPassword })

      await service.changePassword(userId, validated.oldPassword, validated.newPassword)
      res.json({ message: 'Password changed successfully' })
    } catch (error) {
      next(error)
    }
  })

  router.get('/profile', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        next(new UnauthorizedError())
        return
      }
      res.json(req.user)
    } catch (error) {
      next(error)
    }
  })

  router.patch('/profile', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user?.userId
      if (!userId) {
        next(new UnauthorizedError())
        return
      }
      const { username, email } = req.body
      const schema = z.object({
        username: z.string().min(3).optional(),
        email: z.string().email().optional(),
      })
      const validated = schema.parse({ username, email })
      await service.changeUserInfo(userId, validated.username, validated.email)
      res.json({ message: 'Profile updated successfully' })
    } catch (error) {
      next(error)
    }
  })

  return router
}
