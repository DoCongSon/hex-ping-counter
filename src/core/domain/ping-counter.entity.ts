export class IncrementFailedError extends Error {
  constructor(message = 'Counter full, use POST /reset') {
    super(message)
    this.name = 'IncrementFailedError'
  }
}

export type ActionType = 'RESET' | 'INCREMENT' | 'INITIAL'

export class HistoryCounter {
  constructor(public readonly action: ActionType, public readonly timestamp: Date) {}

  static createReset(): HistoryCounter {
    return new HistoryCounter('RESET', new Date())
  }

  static createIncrement(): HistoryCounter {
    return new HistoryCounter('INCREMENT', new Date())
  }

  static createInitial(): HistoryCounter {
    return new HistoryCounter('INITIAL', new Date())
  }
}

export class PingCounter {
  static readonly MAX_VALUE = 100
  static readonly LIMIT_HISTORY = 10

  constructor(public readonly id: string, public readonly count: number, public readonly history: HistoryCounter[]) {}

  static createNew(id: string): PingCounter {
    return new PingCounter(id, 0, [HistoryCounter.createInitial()])
  }

  canIncrement(): boolean {
    return this.count < PingCounter.MAX_VALUE
  }

  increment(): PingCounter {
    if (!this.canIncrement()) {
      throw new IncrementFailedError()
    }
    const newHistory =
      this.history.length >= PingCounter.LIMIT_HISTORY
        ? [...this.history.slice(1), HistoryCounter.createIncrement()]
        : [...this.history, HistoryCounter.createIncrement()]
    return new PingCounter(this.id, this.count + 1, newHistory)
  }

  reset(): PingCounter {
    const newHistory =
      this.history.length >= PingCounter.LIMIT_HISTORY
        ? [...this.history.slice(1), HistoryCounter.createReset()]
        : [...this.history, HistoryCounter.createReset()]
    return new PingCounter(this.id, 0, newHistory)
  }
}
