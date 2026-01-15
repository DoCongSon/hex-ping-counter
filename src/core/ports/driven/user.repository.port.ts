import { User } from '../../domain/user.entity'

export interface UserRepositoryPort {
  getById(id: string): Promise<User | null>
  getByEmail(email: string): Promise<User | null>
  save(user: User): Promise<void>
}
