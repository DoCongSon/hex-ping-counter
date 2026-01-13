import { describe, it, expect } from 'vitest'
import { HistoryCounter } from './history-counter.entity'

describe('HistoryCounter', () => {
  describe('createReset', () => {
    it('should create a reset history counter', () => {
      const id = 'testId'
      const historyCounter = HistoryCounter.createReset(id)
      expect(historyCounter.id).toBe(id)
      expect(historyCounter.action).toBe('RESET')
      expect(historyCounter.timestamp).toBeInstanceOf(Date)
    })
  })
  describe('createIncrement', () => {
    it('should create an increment history counter', () => {
      const id = 'testId'
      const historyCounter = HistoryCounter.createIncrement(id)
      expect(historyCounter.id).toBe(id)
      expect(historyCounter.action).toBe('INCREMENT')
      expect(historyCounter.timestamp).toBeInstanceOf(Date)
    })
  })
})
