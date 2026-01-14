import { HistoryCounter, PingCounter } from '../domain/ping-counter.entity'
import { PingCounterRepositoryPort } from '../ports/driven/ping-counter.repository.port'
import { PingCounterService } from './ping-counter.service'
import { vi, describe, it, expect } from 'vitest'

describe('PingCounterService', () => {
  let mockRepository: PingCounterRepositoryPort
  let service: PingCounterService
  const createCounter = (count: number, historyLength = 0) => {
    const history = Array(historyLength)
      .fill(null)
      .map(() => new HistoryCounter('INCREMENT', new Date()))
    return new PingCounter('globalId', count, history)
  }

  beforeEach(() => {
    mockRepository = {
      getById: vi.fn(),
      save: vi.fn(),
    }
    service = new PingCounterService(mockRepository)
  })

  describe('incrementPingCounter', () => {
    it('should increment counter', async () => {
      const existingCounter = createCounter(5)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      const result = await service.incrementPingCounter()
      expect(result.count).toBe(6)
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
    })

    it('should throw error when incrementing max counter', async () => {
      const maxCounter = createCounter(PingCounter.MAX_VALUE)
      vi.mocked(mockRepository.getById).mockResolvedValue(maxCounter)
      await expect(service.incrementPingCounter()).rejects.toThrowError()
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('resetPingCounter', () => {
    it('should reset existing counter', async () => {
      const existingCounter = createCounter(8)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      const result = await service.resetPingCounter()
      expect(result.count).toBe(0)
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
    })
  })

  describe('getCurrentPingCounter', () => {
    it('should return existing counter', async () => {
      const existingCounter = createCounter(7)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      const result = await service.getCurrentPingCounter()
      expect(result.count).toBe(7)
    })

    it('should create and return new counter if not exists', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null)
      const result = await service.getCurrentPingCounter()
      expect(result.count).toBe(0)
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
      expect(result.history.length).toBe(1)
      expect(result.history[0].action).toBe('INITIAL')
    })
  })
})
