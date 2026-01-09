import { PingCounter } from '../../domain/ping-counter.entity'

export interface PingCounterRepositoryPort {
  getById(id: string): Promise<PingCounter | null>
  reset(id: string): Promise<void>
  save(pingCounter: PingCounter): Promise<void>
}
