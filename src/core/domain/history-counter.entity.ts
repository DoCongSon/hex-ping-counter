export type ActionType = 'RESET' | 'INCREMENT'

export class HistoryCounter {
  constructor(public readonly id: string, public readonly action: ActionType, public readonly timestamp: Date) {}

  static createReset(id: string): HistoryCounter {
    return new HistoryCounter(id, 'RESET', new Date())
  }

  static createIncrement(id: string): HistoryCounter {
    return new HistoryCounter(id, 'INCREMENT', new Date())
  }
}
