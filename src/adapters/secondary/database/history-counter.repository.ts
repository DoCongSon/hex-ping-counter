import { Collection, Db } from 'mongodb'
import { HistoryCounterRepositoryPort } from '../../../core/ports/driven/history-counter.repository.port'
import { ActionType, HistoryCounter } from '../../../core/domain/history-counter.entity'

type HistoryCounterDoc = {
  counterId: string
  timestamp: Date
  action: ActionType
}

function toDoc(entity: HistoryCounter): HistoryCounterDoc {
  return {
    counterId: entity.id,
    action: entity.action,
    timestamp: entity.timestamp,
  }
}

function toDomain(doc: HistoryCounterDoc): HistoryCounter {
  return new HistoryCounter(doc.counterId, doc.action, doc.timestamp)
}

export class HistoryCounterRepository implements HistoryCounterRepositoryPort {
  private histories: Collection<HistoryCounterDoc>

  constructor(db: Db) {
    this.histories = db.collection<HistoryCounterDoc>('counter_histories')
  }

  async getAll(id: string, limit?: number): Promise<HistoryCounter[]> {
    let cursor = this.histories.find({ counterId: id }).sort({ timestamp: -1 })
    if (limit) {
      cursor = cursor.limit(limit)
    }
    const docs = await cursor.toArray()
    return docs.map(toDomain)
  }

  async save(history: HistoryCounter): Promise<HistoryCounter> {
    await this.histories.insertOne(toDoc(history))
    return history
  }
}
