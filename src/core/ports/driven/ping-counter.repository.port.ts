import { PingCounter } from '../../domain/ping-counter.entity'

export interface PingCounterRepositoryPort {
  getById(id: string): Promise<PingCounter | null>
  save(counter: PingCounter): Promise<void>
}
