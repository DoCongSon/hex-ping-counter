import winston from 'winston'
import { LoggerPort } from '../../../core/ports/driven/logger.port'

export class WinstonLogger implements LoggerPort {
  private logger: winston.Logger

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'ping-counter-service' },
      transports: [
        // File transports
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    })

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, ...meta }) => {
              return `${timestamp} [${level}]: ${message} ${
                Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
              }`
            })
          ),
        })
      )
    }
  }

  info(message: string, data?: any): void {
    this.logger.info(message, data)
  }

  warn(message: string, data?: any): void {
    this.logger.warn(message, data)
  }

  error(message: string, error?: Error, data?: any): void {
    this.logger.error(message, {
      errorMessage: error?.message,
      errorStack: error?.stack,
      ...data,
    })
  }

  debug(message: string, data?: any): void {
    this.logger.debug(message, data)
  }
}
