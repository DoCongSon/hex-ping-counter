import { Collection, Db } from 'mongodb'
import { PingCounterRepositoryPort } from '../../../core/ports/driven/ping-counter.repository.port'
import { PingCounter } from '../../../core/domain/ping-counter.entity'

type PingCounterDoc = {
  id: string
  count: number
}

export class PingCounterRepository implements PingCounterRepositoryPort {
  private counters: Collection<PingCounterDoc>

  constructor(db: Db) {
    this.counters = db.collection<PingCounterDoc>('ping_counters')
  }

  async getById(id: string): Promise<PingCounter | null> {
    const doc = await this.counters.findOne({ id })
    if (!doc) {
      return null
    }
    return new PingCounter(doc.id, doc.count)
  }

  async reset(id: string): Promise<void> {
    await this.counters.updateOne({ id }, { $set: { count: 0 } }, { upsert: true })
  }

  async save(pingCounter: PingCounter): Promise<void> {
    await this.counters.updateOne({ id: pingCounter.id }, { $set: { count: pingCounter.count } }, { upsert: true })
  }
}
