import { PingCounter } from '../domain/ping-counter.entity'
import { PingCounterRepositoryPort } from '../ports/driven/ping-counter.repository.port'
import { PingCounterServicePort } from '../ports/driving/ping-counter.service.port'

export class PingCounterService implements PingCounterServicePort {
  private readonly globalId = 'globalId'
  constructor(private readonly pingCounterRepository: PingCounterRepositoryPort) {}

  async getCurrentPingCounter(): Promise<PingCounter> {
    const pingCounter = await this.pingCounterRepository.getById(this.globalId)
    if (!pingCounter) {
      const newCounter = PingCounter.create(this.globalId)
      return newCounter
    }
    return pingCounter
  }

  async incrementPingCounter(): Promise<PingCounter> {
    const pingCounter = await this.getCurrentPingCounter()
    try {
      pingCounter.increment()
    } catch (error) {
      throw error
    }
    await this.pingCounterRepository.save(pingCounter)
    return pingCounter
  }

  async resetPingCounter(): Promise<PingCounter> {
    let pingCounter = await this.getCurrentPingCounter()
    pingCounter.reset()
    await this.pingCounterRepository.save(pingCounter)
    return pingCounter
  }
}
