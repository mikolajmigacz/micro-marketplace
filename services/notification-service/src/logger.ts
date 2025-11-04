/**
 * CloudWatch Logger Service (Mock)
 * Lokalno loguje do console, dla produkcji można rozszerzyć o CloudWatch
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private readonly context: string;
  private readonly logLevel: LogLevel;

  constructor(context: string, logLevel: LogLevel = 'info') {
    this.context = context;
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatLog(level: LogLevel, message: string, meta?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${this.context}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatLog('debug', message, meta));
    }
  }

  info(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.log(this.formatLog('info', message, meta));
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatLog('warn', message, meta));
    }
  }

  error(message: string, error?: Error | Record<string, any>): void {
    if (this.shouldLog('error')) {
      if (error instanceof Error) {
        console.error(
          this.formatLog('error', message, {
            errorMessage: error.message,
            stack: error.stack,
          })
        );
      } else {
        console.error(this.formatLog('error', message, error));
      }
    }
  }
}
