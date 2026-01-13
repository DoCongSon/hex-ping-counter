import { PingCounter } from '../domain/ping-counter.entity'
import { PingCounterRepositoryPort } from '../ports/driven/ping-counter.repository.port'
import { HistoryCounterServicePort } from '../ports/driving/history-counter.service.port'
import { PingCounterService } from './ping-counter.service'
import { vi, describe, it, expect } from 'vitest'

describe('PingCounterService', () => {
  let mockRepository: PingCounterRepositoryPort
  let mockHistoryService: HistoryCounterServicePort
  let service: PingCounterService

  beforeEach(() => {
    mockRepository = {
      getById: vi.fn(),
      save: vi.fn(),
    }
    mockHistoryService = {
      recordIncrement: vi.fn(),
      recordReset: vi.fn(),
      getHistory: vi.fn(),
    }
    service = new PingCounterService(mockRepository, mockHistoryService)
  })

  describe('incrementPingCounter', () => {
    it('should increment counter', async () => {
      const existingCounter = new PingCounter('globalId', 5)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      const result = await service.incrementPingCounter()
      expect(result.count).toBe(6)
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
      expect(mockHistoryService.recordIncrement).toHaveBeenCalled()
    })

    it('should throw error when incrementing max counter', async () => {
      const maxCounter = new PingCounter('globalId', PingCounter.MAX_VALUE)
      vi.mocked(mockRepository.getById).mockResolvedValue(maxCounter)
      await expect(service.incrementPingCounter()).rejects.toThrowError()
      expect(mockRepository.save).not.toHaveBeenCalled()
      expect(mockHistoryService.recordIncrement).not.toHaveBeenCalled()
    })

    it('should handle error during save after increment', async () => {
      const existingCounter = new PingCounter('globalId', 10)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      vi.mocked(mockRepository.save).mockRejectedValue(new Error('DB Error'))
      await expect(service.incrementPingCounter()).rejects.toThrow('DB Error')
      expect(mockHistoryService.recordIncrement).not.toHaveBeenCalled()
    })

    it('should rollback counter when history recording fails', async () => {
      const existingCounter = new PingCounter('globalId', 10)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      vi.mocked(mockHistoryService.recordIncrement).mockRejectedValue(new Error('History Error'))
      await expect(service.incrementPingCounter()).rejects.toThrow('History Error')

      expect(mockRepository.save).toHaveBeenCalledTimes(2) // 1 lần để tăng, 1 lần để rollback
      expect(mockRepository.save).toHaveBeenLastCalledWith(expect.objectContaining({ count: 10 }))
    })
  })

  describe('resetPingCounter', () => {
    it('should reset existing counter', async () => {
      const existingCounter = new PingCounter('globalId', 5)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      const result = await service.resetPingCounter()
      expect(result.count).toBe(0)
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
      expect(mockHistoryService.recordReset).toHaveBeenCalled()
    })
  })

  describe('getCurrentPingCounter', () => {
    it('should return existing counter', async () => {
      const existingCounter = new PingCounter('globalId', 7)
      vi.mocked(mockRepository.getById).mockResolvedValue(existingCounter)
      const result = await service.getCurrentPingCounter()
      expect(result.count).toBe(7)
    })

    it('should create and return new counter if not exists', async () => {
      vi.mocked(mockRepository.getById).mockResolvedValue(null)
      const result = await service.getCurrentPingCounter()
      expect(result.count).toBe(0)
      expect(mockRepository.save).toHaveBeenCalledTimes(1)
    })
  })
})
