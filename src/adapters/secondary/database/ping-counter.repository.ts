import { Collection, Db } from 'mongodb'
import { PingCounterRepositoryPort } from '../../../core/ports/driven/ping-counter.repository.port'
import { PingCounter } from '../../../core/domain/ping-counter.entity'

type PingCounterDoc = {
  _id: string
  count: number
}

function toDoc(entity: PingCounter): PingCounterDoc {
  return { _id: entity.id, count: entity.count }
}

function toDomain(doc: PingCounterDoc): PingCounter {
  return new PingCounter(doc._id, doc.count)
}

export class PingCounterRepository implements PingCounterRepositoryPort {
  private counters: Collection<PingCounterDoc>

  constructor(db: Db) {
    this.counters = db.collection<PingCounterDoc>('ping_counters')
  }

  async getById(id: string): Promise<PingCounter | null> {
    const doc = await this.counters.findOne({ _id: id })
    if (!doc) return null
    return toDomain(doc)
  }

  async save(counter: PingCounter): Promise<void> {
    const doc = toDoc(counter)
    await this.counters.updateOne({ _id: doc._id }, { $set: { count: doc.count } }, { upsert: true })
  }
}
