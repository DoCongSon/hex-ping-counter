import { User } from '../../domain/user.entity'

export interface AuthServicePort {
  login(email: string, password: string): Promise<string>
  register(username: string, email: string, password: string): Promise<User>
  changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void>
  changeUserInfo(userId: string, newUsername?: string, newEmail?: string): Promise<void>
}
