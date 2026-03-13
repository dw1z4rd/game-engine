/**
 * Logger system for engine debugging and monitoring
 */
export class Logger {
  private readonly enableDebug: boolean;
  private readonly logHistory: LogEntry[] = [];
  private readonly maxHistorySize = 1000;

  constructor(enableDebug = false) {
    this.enableDebug = enableDebug;
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: any[]): void {
    if (this.enableDebug) {
      this.log('DEBUG', message, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    this.log('INFO', message, ...args);
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    this.log('WARN', message, ...args);
  }

  /**
   * Log error message
   */
  error(message: string, ...args: any[]): void {
    this.log('ERROR', message, ...args);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, ...args: any[]): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      args,
    };

    // Add to history
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }

    // Console output
    const timestamp = entry.timestamp.toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;

    switch (level) {
      case 'DEBUG':
        console.debug(formattedMessage, ...args);
        break;
      case 'INFO':
        console.info(formattedMessage, ...args);
        break;
      case 'WARN':
        console.warn(formattedMessage, ...args);
        break;
      case 'ERROR':
        console.error(formattedMessage, ...args);
        break;
    }
  }

  /**
   * Get log history
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logHistory.filter(entry => entry.level === level);
  }

  /**
   * Clear log history
   */
  clearHistory(): void {
    this.logHistory.length = 0;
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const errorCount = this.getLogsByLevel('ERROR').length;
    const warnCount = this.getLogsByLevel('WARN').length;
    const recentLogs = this.logHistory.slice(-10);

    return {
      totalLogs: this.logHistory.length,
      errorCount,
      warnCount,
      recentLogs,
    };
  }
}

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  args: any[];
}

interface PerformanceMetrics {
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  recentLogs: LogEntry[];
}