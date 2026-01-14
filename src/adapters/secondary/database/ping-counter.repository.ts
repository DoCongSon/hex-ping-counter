import { Collection, Db } from 'mongodb'
import { PingCounterRepositoryPort } from '../../../core/ports/driven/ping-counter.repository.port'
import { HistoryCounter, PingCounter } from '../../../core/domain/ping-counter.entity'

type PingCounterDoc = {
  _id: string
  count: number
  history: HistoryCounter[]
}
export class PingCounterRepository implements PingCounterRepositoryPort {
  private counters: Collection<PingCounterDoc>

  constructor(db: Db) {
    this.counters = db.collection<PingCounterDoc>('ping_counters')
  }

  async getById(id: string): Promise<PingCounter | null> {
    const doc = await this.counters.findOne({ _id: id })
    if (!doc) {
      return null
    }
    return new PingCounter(doc._id, doc.count, doc.history)
  }

  async save(counter: PingCounter): Promise<PingCounter> {
    const doc: PingCounterDoc = {
      _id: counter.id,
      count: counter.count,
      history: counter.history,
    }
    await this.counters.updateOne({ _id: counter.id }, { $set: doc }, { upsert: true })
    return counter
  }
}
