export type TokenPayload = {
  sub: string // user id
  email: string
  username: string
}

export interface TokenGeneratorPort {
  generate(payload: TokenPayload, expiresIn: string): string
  verify(token: string): TokenPayload | null
}
