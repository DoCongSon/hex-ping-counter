export class IncrementFailedError extends Error {
  constructor(message = 'Counter full, use POST /reset') {
    super(message)
    this.name = 'IncrementFailedError'
  }
}

export class DecrementFailedError extends Error {
  constructor(message = 'Counter is at zero, cannot decrement') {
    super(message)
    this.name = 'DecrementFailedError'
  }
}

export class PingCounter {
  static readonly MAX_VALUE = 100

  constructor(public readonly id: string, public readonly count: number) {}

  static createNew(id: string): PingCounter {
    return new PingCounter(id, 0)
  }

  canIncrement(): boolean {
    return this.count < PingCounter.MAX_VALUE
  }

  increment(): PingCounter {
    if (!this.canIncrement()) {
      throw new IncrementFailedError()
    }
    return new PingCounter(this.id, this.count + 1)
  }

  decrement(): PingCounter {
    if (this.count <= 0) {
      throw new DecrementFailedError()
    }
    return new PingCounter(this.id, this.count - 1)
  }

  reset(): PingCounter {
    return new PingCounter(this.id, 0)
  }
}
