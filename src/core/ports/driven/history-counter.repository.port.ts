import { HistoryCounter } from '../../domain/history-counter.entity'

export interface HistoryCounterRepositoryPort {
  getAll(id: string, limit?: number): Promise<HistoryCounter[]>
  save(history: HistoryCounter): Promise<HistoryCounter>
}
