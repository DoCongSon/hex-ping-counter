import jwt, { SignOptions } from 'jsonwebtoken'
import { TokenGeneratorPort, TokenPayload } from '../../../core/ports/driven/token-generator.port'

export class JwtTokenGenerator implements TokenGeneratorPort {
  constructor(private readonly secret: string) {}

  generate(payload: TokenPayload, expiresIn: string): string {
    const options: SignOptions = { expiresIn: expiresIn as SignOptions['expiresIn'] }
    return jwt.sign(payload, this.secret, options)
  }

  verify(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.secret) as TokenPayload
    } catch (error) {
      return null
    }
  }
}
