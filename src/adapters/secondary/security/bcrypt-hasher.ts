import bcrypt from 'bcrypt'
import { PasswordHasherPort } from '../../../core/ports/driven/password-hasher.port'

export class BcryptHasher implements PasswordHasherPort {
  private readonly saltRounds = 10

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
