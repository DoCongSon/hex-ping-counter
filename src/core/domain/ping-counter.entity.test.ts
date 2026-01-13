import { describe, it, expect } from 'vitest'
import { DecrementFailedError, IncrementFailedError, PingCounter } from './ping-counter.entity'

describe('PingCounter', () => {
  describe('createNew', () => {
    it('should create counter with count = 0', () => {
      const counter = PingCounter.createNew('test-id')
      expect(counter.id).toBe('test-id')
      expect(counter.count).toBe(0)
    })
  })

  describe('canIncrement', () => {
    it('should can increment when count is less than max', () => {
      const counter = new PingCounter('test-id', PingCounter.MAX_VALUE - 1)
      expect(counter.canIncrement()).toBe(true)
    })
    it('should not can increment when count is equal to max', () => {
      const counter = new PingCounter('test-id', PingCounter.MAX_VALUE)
      expect(counter.canIncrement()).toBe(false)
    })
  })

  describe('increment', () => {
    it('should increment count by 1 when possible', () => {
      const counter = new PingCounter('test-id', 50)
      const incremented = counter.increment()
      expect(incremented.count).toBe(51)
      expect(counter.count).toBe(50)
      expect(incremented.id).toBe('test-id')
    })

    it('should throw IncrementFailedError when count is at max', () => {
      const counter = new PingCounter('test-id', PingCounter.MAX_VALUE)
      expect(() => counter.increment()).toThrowError(IncrementFailedError)
    })
  })

  describe('decrement', () => {
    it('should decrement count by 1 when count > 0', () => {
      const counter = new PingCounter('test-id', 50)
      const decremented = counter.decrement()
      expect(decremented.count).toBe(49)
      expect(counter.count).toBe(50)
      expect(decremented.id).toBe('test-id')
    })

    it('should throw DecrementFailedError when count <= 0', () => {
      const counter = new PingCounter('test-id', 0)
      expect(() => counter.decrement()).toThrowError(DecrementFailedError)
    })
  })

  describe('reset', () => {
    it('should reset count to 0', () => {
      const counter = new PingCounter('test-id', 75)
      const resetCounter = counter.reset()
      expect(resetCounter.count).toBe(0)
      expect(resetCounter.id).toBe('test-id')
    })
  })
})
