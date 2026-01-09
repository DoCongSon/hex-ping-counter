import { PingCounter } from '../../domain/ping-counter.entity'

export interface PingCounterServicePort {
  incrementPingCounter(): Promise<PingCounter>
  resetPingCounter(): Promise<PingCounter>
  getCurrentPingCounter(): Promise<PingCounter>
}
