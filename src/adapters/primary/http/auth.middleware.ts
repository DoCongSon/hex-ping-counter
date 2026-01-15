import { NextFunction, Request, Response } from 'express'
import { TokenGeneratorPort } from '../../../core/ports/driven/token-generator.port'
import { ValidationError } from './error-handler'

export function createAuthMiddleware(tokenGenerator: TokenGeneratorPort) {
  return function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers['authorization']
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(new ValidationError('Authorization header missing or malformed'))
        return
      }

      const token = authHeader.split(' ')[1]
      const payload = tokenGenerator.verify(token)
      if (!payload) {
        next(new ValidationError('Invalid or missing token'))
        return
      }

      req.user = {
        userId: payload.sub,
        userEmail: payload.email,
        username: payload.username,
      }
      next()
    } catch (error) {
      next(error)
    }
  }
}
