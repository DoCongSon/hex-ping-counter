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

  const repo = new PingCounterRepository(db)
  const service = new PingCounterService(repo)
  app.use('/', buildPingCounterRouter(service))

  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`HTTP listening on ${port}`))
}

bootstrap().catch((e) => {
  console.error(e)
  process.exit(1)
})
