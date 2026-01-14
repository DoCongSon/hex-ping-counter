import 'dotenv/config'
import express from 'express'
import bodyParser from 'body-parser'
import { MongoClient } from 'mongodb'
import { PingCounterService } from './core/services/ping-counter.service'
import { PingCounterRepository } from './adapters/secondary/database/ping-counter.repository'
import { buildPingCounterRouter } from './adapters/primary/http/ping-counter.controller'

async function bootstrap() {
  const app = express()
  app.use(bodyParser.json())

  const mongoUri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB

  if (!mongoUri || !dbName) {
    throw new Error('MONGODB_URI and MONGODB_DB must be set in environment variables')
  }
  const client = new MongoClient(mongoUri)
  await client.connect()
  const db = client.db(dbName)

  const pingCounterRepo = new PingCounterRepository(db)
  const pingCounterService = new PingCounterService(pingCounterRepo)

  app.use('/', buildPingCounterRouter(pingCounterService))

  const port = process.env.PORT || 3000
  const server = app.listen(port, () => console.log(`HTTP listening on ${port}`))

  process.on('SIGINT', async () => {
    console.log('Shutting down...')
    server.close(() => console.log('HTTP server closed'))
    await client.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('Shutting down...')
    server.close(() => console.log('HTTP server closed'))
    await client.close()
    process.exit(0)
  })
}

bootstrap().catch((e) => {
  console.error(e)
  process.exit(1)
})
