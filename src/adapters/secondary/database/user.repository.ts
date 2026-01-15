import { Collection, Db } from 'mongodb'
import { User } from '../../../core/domain/user.entity'
import { UserRepositoryPort } from '../../../core/ports/driven/user.repository.port'

type UserDoc = {
  _id: string
  username: string
  email: string
  passwordHash: string
}

export class UserRepository implements UserRepositoryPort {
  private users: Collection<UserDoc>

  constructor(db: Db) {
    this.users = db.collection<UserDoc>('users')
  }

  async getById(id: string): Promise<User | null> {
    const doc = await this.users.findOne({ _id: id })
    if (!doc) {
      return null
    }
    return new User(doc._id, doc.username, doc.email, doc.passwordHash)
  }

  async getByEmail(email: string): Promise<User | null> {
    const doc = await this.users.findOne({ email })
    if (!doc) {
      return null
    }
    return new User(doc._id, doc.username, doc.email, doc.passwordHash)
  }

  async save(user: User): Promise<void> {
    const doc: UserDoc = {
      _id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
    }
    await this.users.updateOne({ _id: user.id }, { $set: doc }, { upsert: true })
  }
}
