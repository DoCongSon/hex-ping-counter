export class IncrementFailedError extends Error {
  constructor(message = 'Counter full, use POST /reset') {
    super(message)
    this.name = 'IncrementFailedError'
  }
}

export class PingCounter {
  static readonly MAX_VALUE = 100

  constructor(public id: string, public count: number) {}

  static create(id: 'globalId'): PingCounter {
    return new PingCounter(id, 0)
  }

  increment(): void {
    if (this.count >= PingCounter.MAX_VALUE) {
      throw new IncrementFailedError()
    }
    this.count += 1
  }

  reset(): void {
    this.count = 0
  }
}
