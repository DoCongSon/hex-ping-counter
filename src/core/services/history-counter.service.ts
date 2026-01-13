import { HistoryCounter } from '../domain/history-counter.entity'
import { HistoryCounterRepositoryPort } from '../ports/driven/history-counter.repository.port'
import { HistoryCounterServicePort } from '../ports/driving/history-counter.service.port'

export class HistoryCounterService implements HistoryCounterServicePort {
  private readonly globalId = 'globalId'

  constructor(private readonly historyRepo: HistoryCounterRepositoryPort) {}

  async getHistory(limit?: number): Promise<HistoryCounter[]> {
    return this.historyRepo.getAll(this.globalId, limit)
  }

  async recordIncrement(): Promise<HistoryCounter> {
    const history = HistoryCounter.createIncrement(this.globalId)
    await this.historyRepo.save(history)
    return history
  }

  async recordReset(): Promise<HistoryCounter> {
    const history = HistoryCounter.createReset(this.globalId)
    await this.historyRepo.save(history)
    return history
  }
}
