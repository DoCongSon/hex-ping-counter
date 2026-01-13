import { HistoryCounter } from '../../domain/history-counter.entity'

export interface HistoryCounterServicePort {
  getHistory(limit?: number): Promise<HistoryCounter[]>
  recordIncrement(): Promise<HistoryCounter>
  recordReset(): Promise<HistoryCounter>
}
