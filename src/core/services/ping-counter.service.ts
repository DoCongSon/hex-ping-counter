import { PingCounter } from '../domain/ping-counter.entity'
import { PingCounterRepositoryPort } from '../ports/driven/ping-counter.repository.port'
import { PingCounterServicePort } from '../ports/driving/ping-counter.service.port'

export class PingCounterService implements PingCounterServicePort {
  constructor(private readonly pingCounterRepository: PingCounterRepositoryPort) {}

  private async getOrCreateCounter(id: string): Promise<PingCounter> {
    const existing = await this.pingCounterRepository.getById(id)
    if (existing) return existing
    const newCounter = PingCounter.createNew(id)
    await this.pingCounterRepository.save(newCounter)
    return newCounter
  }

  async getCurrentPingCounter(id: string): Promise<PingCounter> {
    return this.getOrCreateCounter(id)
  }

  async incrementPingCounter(id: string): Promise<PingCounter> {
    const counter = await this.getOrCreateCounter(id)
    const incremented = counter.increment()
    await this.pingCounterRepository.save(incremented)
    return incremented
  }

  async resetPingCounter(id: string): Promise<PingCounter> {
    const counter = await this.getOrCreateCounter(id)
    const resetCounter = counter.reset()
    await this.pingCounterRepository.save(resetCounter)
    return resetCounter
  }
}
