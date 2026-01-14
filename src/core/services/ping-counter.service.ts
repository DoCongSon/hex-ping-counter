import { PingCounter } from '../domain/ping-counter.entity'
import { PingCounterRepositoryPort } from '../ports/driven/ping-counter.repository.port'
import { PingCounterServicePort } from '../ports/driving/ping-counter.service.port'

export class PingCounterService implements PingCounterServicePort {
  private readonly globalId = 'globalId'

  constructor(private readonly pingCounterRepository: PingCounterRepositoryPort) {}

  private async getOrCreateCounter(): Promise<PingCounter> {
    const existing = await this.pingCounterRepository.getById(this.globalId)
    if (existing) return existing
    const newCounter = PingCounter.createNew(this.globalId)
    await this.pingCounterRepository.save(newCounter)
    return newCounter
  }

  async getCurrentPingCounter(): Promise<PingCounter> {
    return this.getOrCreateCounter()
  }

  async incrementPingCounter(): Promise<PingCounter> {
    const counter = await this.getOrCreateCounter()
    const incremented = counter.increment()
    await this.pingCounterRepository.save(incremented)
    return incremented
  }

  async resetPingCounter(): Promise<PingCounter> {
    const counter = await this.getOrCreateCounter()
    const resetCounter = counter.reset()
    await this.pingCounterRepository.save(resetCounter)
    return resetCounter
  }
}
