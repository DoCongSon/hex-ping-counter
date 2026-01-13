import { vi, describe, it, expect } from 'vitest'
import { HistoryCounterService } from './history-counter.service'
import { HistoryCounterRepositoryPort } from '../ports/driven/history-counter.repository.port'
import { HistoryCounter } from '../domain/history-counter.entity'

describe('HistoryCounterService', () => {
  let service: HistoryCounterService
  let mockHistoryCounterRepository: HistoryCounterRepositoryPort

  beforeEach(() => {
    mockHistoryCounterRepository = {
      getAll: vi.fn(),
      save: vi.fn(),
    }
    service = new HistoryCounterService(mockHistoryCounterRepository)
  })

  describe('getHistory', () => {
    it('should return history records', async () => {
      const mockRecords: HistoryCounter[] = [
        { id: 'globalId', action: 'INCREMENT', timestamp: new Date() },
        { id: 'globalId', action: 'RESET', timestamp: new Date() },
        { id: 'globalId', action: 'INCREMENT', timestamp: new Date() },
      ]
      vi.mocked(mockHistoryCounterRepository.getAll).mockResolvedValue(mockRecords)
      const result = await service.getHistory()
      expect(result).toEqual(mockRecords)
      expect(mockHistoryCounterRepository.getAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('recordIncrement', () => {
    it('should save increment record', async () => {
      const record: HistoryCounter = { id: 'globalId', action: 'INCREMENT', timestamp: new Date() }
      vi.mocked(mockHistoryCounterRepository.save).mockResolvedValue(record)
      const result = await service.recordIncrement()
      expect(mockHistoryCounterRepository.save).toHaveBeenCalledWith(expect.objectContaining({ action: 'INCREMENT' }))
    })
  })

  describe('recordReset', () => {
    it('should save reset record', async () => {
      const record: HistoryCounter = { id: 'globalId', action: 'RESET', timestamp: new Date() }
      vi.mocked(mockHistoryCounterRepository.save).mockResolvedValue(record)
      const result = await service.recordReset()
      expect(mockHistoryCounterRepository.save).toHaveBeenCalledWith(expect.objectContaining({ action: 'RESET' }))
    })
  })
})
