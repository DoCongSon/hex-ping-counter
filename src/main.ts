import 'dotenv/config'
import express from 'express'
import { MongoClient } from 'mongodb'
import { PingCounterService } from './core/services/ping-counter.service'
import { PingCounterRepository } from './adapters/secondary/database/ping-counter.repository'
import { buildPingCounterRouter } from './adapters/primary/http/ping-counter.controller'
import { createAuthMiddleware } from './adapters/primary/http/auth.middleware'
import { UserRepository } from './adapters/secondary/database/user.repository'
import { BcryptHasher } from './adapters/secondary/security/bcrypt-hasher'
import { JwtTokenGenerator } from './adapters/secondary/security/jwt-token-generator'
import { AuthService } from './core/services/auth.service'
import { buildAuthController } from './adapters/primary/http/auth.controller'
import { WinstonLogger } from './adapters/secondary/logging/winston-logger'
import { createErrorHandler } from './adapters/primary/http/error-handler'

async function bootstrap() {
  const app = express()
  app.use(express.json())

  const logger = new WinstonLogger()
  logger.info('Application starting...')

  const mongoUri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB
  const jwtSecret = process.env.JWT_SECRET

  if (!mongoUri || !dbName) {
    logger.error('MONGODB_URI and MONGODB_DB must be set in environment variables')
    throw new Error('MONGODB_URI and MONGODB_DB must be set in environment variables')
  }
  if (!jwtSecret || jwtSecret.length < 32) {
    logger.error('JWT_SECRET must be set in environment variables and be at least 32 characters long')
    throw new Error('JWT_SECRET must be set in environment variables and be at least 32 characters long')
  }
  const client = new MongoClient(mongoUri)
  try {
    await client.connect()
    logger.info('Connected to MongoDB')
  } catch (error) {
    logger.error('Failed to connect to MongoDB', error as Error)
    throw error
  }
  const db = client.db(dbName)

  const pingCounterRepo = new PingCounterRepository(db)
  const userRepository = new UserRepository(db)
  const passwordHasher = new BcryptHasher()
  const tokenGenerator = new JwtTokenGenerator(jwtSecret)

  const pingCounterService = new PingCounterService(pingCounterRepo)
  const authService = new AuthService(userRepository, passwordHasher, tokenGenerator)

  const authMiddleware = createAuthMiddleware(tokenGenerator)

  app.use('/auth', buildAuthController(authService, authMiddleware))
  app.use('/ping', authMiddleware, buildPingCounterRouter(pingCounterService))

  app.use(createErrorHandler(logger))

  const port = process.env.PORT || 3000
  const server = app.listen(port, () => logger.info(`HTTP listening on ${port}`))

  process.on('SIGINT', async () => {
    logger.info('Shutting down...')
    server.close(() => logger.info('HTTP server closed'))
    await client.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    logger.info('Shutting down...')
    server.close(() => logger.info('HTTP server closed'))
    await client.close()
    process.exit(0)
  })
}

bootstrap().catch((e) => {
  process.exit(1)
})
