declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string
        userEmail: string
        username: string
      }
    }
  }
}

export {}
