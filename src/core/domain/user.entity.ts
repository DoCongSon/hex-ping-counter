export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly passwordHash: string
  ) {}

  static createNew(id: string, username: string, email: string, passwordHash: string): User {
    if (!this.isValidEmail(email)) {
      throw new Error('Invalid email format')
    }
    return new User(id, username, email, passwordHash)
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (email.length > 254) return false
    if (!emailRegex.test(email)) return false

    const [local, domain] = email.split('@')
    if (local.length > 64) return false
    if (domain.length > 255) return false

    return true
  }

  changePassword(newPasswordHash: string): User {
    return new User(this.id, this.username, this.email, newPasswordHash)
  }

  changeInfo({ newUsername, newEmail }: { newUsername?: string; newEmail?: string }): User {
    if (newEmail && !User.isValidEmail(newEmail)) {
      throw new Error('Invalid email format')
    }
    return new User(this.id, newUsername ?? this.username, newEmail ?? this.email, this.passwordHash)
  }
}
