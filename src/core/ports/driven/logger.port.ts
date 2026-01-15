export interface LoggerPort {
  info(message: string, data?: any): void
  warn(message: string, data?: any): void
  error(message: string, error?: Error, data?: any): void
  debug(message: string, data?: any): void
}
