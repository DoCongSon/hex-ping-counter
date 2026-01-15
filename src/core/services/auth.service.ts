import { User } from '../domain/user.entity'
import { PasswordHasherPort } from '../ports/driven/password-hasher.port'
import { TokenGeneratorPort } from '../ports/driven/token-generator.port'
import { UserRepositoryPort } from '../ports/driven/user.repository.port'
import { AuthServicePort } from '../ports/driving/auth.service.port'
import { randomUUID } from 'crypto'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password')
    this.name = 'InvalidCredentialsError'
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor(email: string) {
    super(`Email ${email} already exists`)
    this.name = 'EmailAlreadyExistsError'
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super('User not found')
    this.name = 'UserNotFoundError'
  }
}

export class InvalidPasswordError extends AuthError {
  constructor() {
    super('Old password is incorrect')
    this.name = 'InvalidPasswordError'
  }
}

export class AuthService implements AuthServicePort {
  constructor(
    private readonly userRepository: UserRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenGenerator: TokenGeneratorPort
  ) {}

  async login(email: string, password: string): Promise<string> {
    const user = await this.userRepository.getByEmail(email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const isPasswordValid = await this.passwordHasher.compare(password, user.passwordHash)
    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    const token = this.tokenGenerator.generate(
      {
        sub: user.id,
        email: user.email,
        username: user.username,
      },
      '1h'
    )
    return token
  }

  async register(username: string, email: string, password: string): Promise<User> {
    const existing = await this.userRepository.getByEmail(email)
    if (existing) {
      throw new EmailAlreadyExistsError(email)
    }
    const user = User.createNew(randomUUID(), username, email, await this.passwordHasher.hash(password))
    await this.userRepository.save(user)
    return user
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new UserNotFoundError()
    }

    const isOldPasswordValid = await this.passwordHasher.compare(oldPassword, user.passwordHash)
    if (!isOldPasswordValid) {
      throw new InvalidPasswordError()
    }

    const updatedUser = user.changePassword(await this.passwordHasher.hash(newPassword))
    await this.userRepository.save(updatedUser)
  }

  async changeUserInfo(userId: string, newUsername?: string, newEmail?: string): Promise<void> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new UserNotFoundError()
    }

    if (newEmail && newEmail !== user.email) {
      const existing = await this.userRepository.getByEmail(newEmail)
      if (existing) {
        throw new EmailAlreadyExistsError(newEmail)
      }
    }

    const updatedUser = user.changeInfo({ newUsername, newEmail })
    await this.userRepository.save(updatedUser)
  }
}
