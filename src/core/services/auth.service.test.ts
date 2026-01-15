import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from './auth.service'
import { PasswordHasherPort } from '../ports/driven/password-hasher.port'
import { TokenGeneratorPort } from '../ports/driven/token-generator.port'
import { UserRepositoryPort } from '../ports/driven/user.repository.port'
import { User } from '../domain/user.entity'

describe('AuthService', () => {
  let authService: AuthService
  let userRepository: UserRepositoryPort
  let passwordHasher: PasswordHasherPort
  let tokenGenerator: TokenGeneratorPort

  beforeEach(() => {
    userRepository = {
      getByEmail: vi.fn(),
      getById: vi.fn(),
      save: vi.fn(),
    } as unknown as UserRepositoryPort

    passwordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    } as unknown as PasswordHasherPort

    tokenGenerator = {
      generate: vi.fn(),
    } as unknown as TokenGeneratorPort

    authService = new AuthService(userRepository, passwordHasher, tokenGenerator)
  })

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      const expectedToken = 'jwt-token-123'

      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(user)
      vi.mocked(passwordHasher.compare).mockResolvedValueOnce(true)
      vi.mocked(tokenGenerator.generate).mockReturnValueOnce(expectedToken)

      const token = await authService.login('john@example.com', 'password')

      expect(token).toBe(expectedToken)
      expect(userRepository.getByEmail).toHaveBeenCalledWith('john@example.com')
      expect(passwordHasher.compare).toHaveBeenCalledWith('password', 'hashedPassword')
      expect(tokenGenerator.generate).toHaveBeenCalledWith(
        {
          sub: 'user-1',
          email: 'john@example.com',
          username: 'john_doe',
        },
        '1h'
      )
    })

    it('should throw error when user does not exist', async () => {
      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(null)

      await expect(authService.login('nonexistent@example.com', 'password')).rejects.toThrow(
        'Invalid email or password'
      )
    })

    it('should throw error when password is invalid', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')

      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(user)
      vi.mocked(passwordHasher.compare).mockResolvedValueOnce(false)

      await expect(authService.login('john@example.com', 'wrongPassword')).rejects.toThrow('Invalid email or password')
    })
  })

  describe('register', () => {
    it('should create and return a new user', async () => {
      const hashedPassword = 'hashed-password-123'

      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(null)
      vi.mocked(passwordHasher.hash).mockResolvedValueOnce(hashedPassword)
      vi.mocked(userRepository.save).mockResolvedValueOnce(undefined)

      const result = await authService.register('jane_doe', 'jane@example.com', 'password123')

      expect(result.username).toBe('jane_doe')
      expect(result.email).toBe('jane@example.com')
      expect(result.passwordHash).toBe(hashedPassword)
      expect(userRepository.getByEmail).toHaveBeenCalledWith('jane@example.com')
      expect(passwordHasher.hash).toHaveBeenCalledWith('password123')
      expect(userRepository.save).toHaveBeenCalled()
    })

    it('should throw error when email already exists', async () => {
      const existingUser = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')

      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(existingUser)

      await expect(authService.register('jane_doe', 'john@example.com', 'password123')).rejects.toThrow(
        'Email already exists'
      )
      expect(passwordHasher.hash).not.toHaveBeenCalled()
    })

    it('should hash password before saving', async () => {
      const plainPassword = 'myPassword123'
      const hashedPassword = 'hashed-value'

      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(null)
      vi.mocked(passwordHasher.hash).mockResolvedValueOnce(hashedPassword)

      await authService.register('jane_doe', 'jane@example.com', plainPassword)

      expect(passwordHasher.hash).toHaveBeenCalledWith(plainPassword)
    })
  })

  describe('changePassword', () => {
    it('should update password when old password is correct', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'oldHashedPassword')
      const newHashedPassword = 'newHashedPassword'

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(passwordHasher.compare).mockResolvedValueOnce(true)
      vi.mocked(passwordHasher.hash).mockResolvedValueOnce(newHashedPassword)
      vi.mocked(userRepository.save).mockResolvedValueOnce(undefined)

      await authService.changePassword('user-1', 'oldPassword', 'newPassword')

      expect(userRepository.getById).toHaveBeenCalledWith('user-1')
      expect(passwordHasher.compare).toHaveBeenCalledWith('oldPassword', 'oldHashedPassword')
      expect(passwordHasher.hash).toHaveBeenCalledWith('newPassword')
      expect(userRepository.save).toHaveBeenCalled()
    })

    it('should throw error when user does not exist', async () => {
      vi.mocked(userRepository.getById).mockResolvedValueOnce(null)

      await expect(authService.changePassword('nonexistent-user', 'oldPassword', 'newPassword')).rejects.toThrow(
        'User not found'
      )
    })

    it('should throw error when old password is incorrect', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'oldHashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(passwordHasher.compare).mockResolvedValueOnce(false)

      await expect(authService.changePassword('user-1', 'wrongPassword', 'newPassword')).rejects.toThrow(
        'Old password is incorrect'
      )
      expect(passwordHasher.hash).not.toHaveBeenCalled()
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('should not save when old password validation fails', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'oldHashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(passwordHasher.compare).mockResolvedValueOnce(false)

      try {
        await authService.changePassword('user-1', 'wrongPassword', 'newPassword')
      } catch {
        // Expected error
      }

      expect(userRepository.save).not.toHaveBeenCalled()
    })
  })

  describe('changeUserInfo', () => {
    it('should update username when provided', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(userRepository.save).mockResolvedValueOnce(undefined)

      await authService.changeUserInfo('user-1', 'jane_doe', undefined)

      expect(userRepository.getById).toHaveBeenCalledWith('user-1')
      expect(userRepository.save).toHaveBeenCalled()
    })

    it('should update email when provided and not already taken', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(null)
      vi.mocked(userRepository.save).mockResolvedValueOnce(undefined)

      await authService.changeUserInfo('user-1', undefined, 'newemail@example.com')

      expect(userRepository.getByEmail).toHaveBeenCalledWith('newemail@example.com')
      expect(userRepository.save).toHaveBeenCalled()
    })

    it('should update both username and email', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(null)
      vi.mocked(userRepository.save).mockResolvedValueOnce(undefined)

      await authService.changeUserInfo('user-1', 'jane_doe', 'jane@example.com')

      expect(userRepository.getById).toHaveBeenCalledWith('user-1')
      expect(userRepository.getByEmail).toHaveBeenCalledWith('jane@example.com')
      expect(userRepository.save).toHaveBeenCalled()
    })

    it('should throw error when user does not exist', async () => {
      vi.mocked(userRepository.getById).mockResolvedValueOnce(null)

      await expect(authService.changeUserInfo('nonexistent-user', 'jane_doe', undefined)).rejects.toThrow(
        'User not found'
      )
    })

    it('should throw error when new email already exists', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      const existingUser = new User('user-2', 'jane_doe', 'jane@example.com', 'hashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(existingUser)

      await expect(authService.changeUserInfo('user-1', undefined, 'jane@example.com')).rejects.toThrow(
        'Email already exists'
      )
      expect(userRepository.save).not.toHaveBeenCalled()
    })

    it('should not check email availability when email is not changed', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(userRepository.save).mockResolvedValueOnce(undefined)

      await authService.changeUserInfo('user-1', 'jane_doe', 'john@example.com')

      expect(userRepository.getByEmail).not.toHaveBeenCalled()
    })

    it('should not save when email is already taken', async () => {
      const user = new User('user-1', 'john_doe', 'john@example.com', 'hashedPassword')
      const existingUser = new User('user-2', 'jane_doe', 'jane@example.com', 'hashedPassword')

      vi.mocked(userRepository.getById).mockResolvedValueOnce(user)
      vi.mocked(userRepository.getByEmail).mockResolvedValueOnce(existingUser)

      try {
        await authService.changeUserInfo('user-1', undefined, 'jane@example.com')
      } catch {
        // Expected error
      }

      expect(userRepository.save).not.toHaveBeenCalled()
    })
  })
})
