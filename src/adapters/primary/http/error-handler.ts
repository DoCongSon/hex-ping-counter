import { NextFunction, Request, Response } from 'express'
import { LoggerPort } from '../../../core/ports/driven/logger.port'
import z from 'zod'

export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string, public readonly isOperational = true) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message)
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(400, message)
  }
}

export function createErrorHandler(logger: LoggerPort) {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const requestId = req.user?.userId || 'unknown'

    if (err instanceof AppError) {
      logger.warn(`AppError: ${err.message}`, {
        requestId,
        statusCode: err.statusCode,
        url: req.url,
        method: req.method,
      })

      return res.status(err.statusCode).json({
        error: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      })
    }

    if (err instanceof z.ZodError) {
      logger.warn(`Validation error: ${err.message}`, {
        requestId,
        url: req.url,
        method: req.method,
      })

      return res.status(400).json({
        error: 'Validation error',
        details: err.issues,
      })
    }

    logger.error(`Unexpected error: ${err.message}`, err, {
      requestId,
      url: req.url,
      method: req.method,
      userAgent: req.headers['user-agent'],
    })

    return res.status(500).json({
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { message: err.message }),
    })
  }
}
