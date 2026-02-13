// Logger Utility - Structured logging with [AppShell] prefix

class AppShellLogger {
  private prefix = '[AppShell]';
  private isDevelopment = __DEV__;

  debug(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`${this.prefix} ${message}`, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    console.log(`${this.prefix} ${message}`, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.prefix} ${message}`, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(`${this.prefix} ${message}`, ...args);
  }
}

export const Logger = new AppShellLogger();
