import { describe, it, expect } from 'vitest'
import { HistoryCounter, IncrementFailedError, PingCounter } from './ping-counter.entity'
describe('PingCounter', () => {
  describe('createNew', () => {
    it('should create counter with count = 0 and initial history', () => {
      const counter = PingCounter.createNew('test-id')
      expect(counter.count).toBe(0)
      expect(counter.history).toHaveLength(1)
      expect(counter.history[0].action).toBe('INITIAL')
    })
  })

  describe('increment', () => {
    it('should increment count and add INCREMENT to history', () => {
      const counter = new PingCounter('test-id', 5, [])
      const incremented = counter.increment()
      expect(incremented.count).toBe(6)
      expect(incremented.history).toHaveLength(1)
      expect(incremented.history[0].action).toBe('INCREMENT')
    })

    it('should remove oldest entry when history is full', () => {
      const oldEntry = new HistoryCounter('INITIAL', new Date('2020-01-01'))
      const fullHistory = [
        oldEntry,
        ...Array(9)
          .fill(null)
          .map(() => new HistoryCounter('INCREMENT', new Date())),
      ]
      const counter = new PingCounter('test-id', 5, fullHistory)

      const incremented = counter.increment()

      expect(incremented.history[0].action).not.toBe('INITIAL')
    })

    it('should throw IncrementFailedError when count is at MAX_VALUE', () => {
      const counter = new PingCounter('test-id', PingCounter.MAX_VALUE, [])
      expect(() => counter.increment()).toThrow(IncrementFailedError)
    })
  })

  describe('reset', () => {
    it('should reset count to 0 and add RESET to history', () => {
      const counter = new PingCounter('test-id', 50, [])
      const resetCounter = counter.reset()
      expect(resetCounter.count).toBe(0)
      expect(resetCounter.history[0].action).toBe('RESET')
    })
  })
})
