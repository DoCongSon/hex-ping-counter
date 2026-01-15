import { User } from './user.entity'
import { describe, it, expect } from 'vitest'

describe('User', () => {
  describe('createNew', () => {
    it('should create a new user with valid data', () => {
      const user = User.createNew('user-1', 'john_doe', 'john@example.com', 'hashedPassword123')
      expect(user.id).toBe('user-1')
      expect(user.username).toBe('john_doe')
      expect(user.email).toBe('john@example.com')
      expect(user.passwordHash).toBe('hashedPassword123')
    })

    it('should throw error for invalid email format', () => {
      expect(() => User.createNew('user-1', 'john_doe', 'invalid-email', 'hashedPassword123')).toThrowError(
        'Invalid email format'
      )
    })

    it('should throw error for email without domain', () => {
      expect(() => User.createNew('user-1', 'john_doe', 'john@', 'hashedPassword123')).toThrowError(
        'Invalid email format'
      )
    })

    it('should throw error for email with spaces', () => {
      expect(() => User.createNew('user-1', 'john_doe', 'john @example.com', 'hashedPassword123')).toThrowError(
        'Invalid email format'
      )
    })
  })

  describe('changePassword', () => {
    it('should return new user with updated password hash', () => {
      const originalUser = new User('user-1', 'john_doe', 'john@example.com', 'oldHash')
      const updatedUser = originalUser.changePassword('newHash')

      expect(updatedUser.id).toBe(originalUser.id)
      expect(updatedUser.username).toBe(originalUser.username)
      expect(updatedUser.email).toBe(originalUser.email)
      expect(updatedUser.passwordHash).toBe('newHash')
    })

    it('should not mutate the original user', () => {
      const originalUser = new User('user-1', 'john_doe', 'john@example.com', 'oldHash')
      originalUser.changePassword('newHash')

      expect(originalUser.passwordHash).toBe('oldHash')
    })
  })

  describe('changeInfo', () => {
    it('should update username only', () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      const updatedUser = user.changeInfo({ newUsername: 'jane_doe' })

      expect(updatedUser.username).toBe('jane_doe')
      expect(updatedUser.email).toBe('john@example.com')
      expect(updatedUser.id).toBe('user-1')
      expect(updatedUser.passwordHash).toBe('hashedPassword')
    })

    it('should update email only', () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      const updatedUser = user.changeInfo({ newEmail: 'newemail@example.com' })

      expect(updatedUser.username).toBe('john_doe')
      expect(updatedUser.email).toBe('newemail@example.com')
      expect(updatedUser.passwordHash).toBe('hashedPassword')
    })

    it('should update both username and email', () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      const updatedUser = user.changeInfo({ newUsername: 'jane_doe', newEmail: 'jane@example.com' })

      expect(updatedUser.username).toBe('jane_doe')
      expect(updatedUser.email).toBe('jane@example.com')
      expect(updatedUser.passwordHash).toBe('hashedPassword')
    })

    it('should throw error for invalid email format', () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      expect(() => user.changeInfo({ newEmail: 'invalid-email' })).toThrowError('Invalid email format')
    })

    it('should preserve existing values when none provided', () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      const updatedUser = user.changeInfo({})

      expect(updatedUser.username).toBe('john_doe')
      expect(updatedUser.email).toBe('john@example.com')
    })

    it('should not mutate the original user', () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      user.changeInfo({ newUsername: 'jane_doe', newEmail: 'jane@example.com' })

      expect(user.username).toBe('john_doe')
      expect(user.email).toBe('john@example.com')
    })
  })
})
