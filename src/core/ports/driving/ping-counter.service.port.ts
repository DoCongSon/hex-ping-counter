import { PingCounter } from '../../domain/ping-counter.entity'

export interface PingCounterServicePort {
  incrementPingCounter(id: string): Promise<PingCounter>
  resetPingCounter(id: string): Promise<PingCounter>
  getCurrentPingCounter(id: string): Promise<PingCounter>
}
