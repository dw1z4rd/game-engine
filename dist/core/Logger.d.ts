/**
 * Logger system for engine debugging and monitoring
 */
export declare class Logger {
    private readonly enableDebug;
    private readonly logHistory;
    private readonly maxHistorySize;
    constructor(enableDebug?: boolean);
    /**
     * Log debug message
     */
    debug(message: string, ...args: any[]): void;
    /**
     * Log info message
     */
    info(message: string, ...args: any[]): void;
    /**
     * Log warning message
     */
    warn(message: string, ...args: any[]): void;
    /**
     * Log error message
     */
    error(message: string, ...args: any[]): void;
    /**
     * Internal logging method
     */
    private log;
    /**
     * Get log history
     */
    getHistory(): LogEntry[];
    /**
     * Get logs by level
     */
    getLogsByLevel(level: LogLevel): LogEntry[];
    /**
     * Clear log history
     */
    clearHistory(): void;
    /**
     * Get performance metrics
     */
    getPerformanceMetrics(): PerformanceMetrics;
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
export {};
//# sourceMappingURL=Logger.d.ts.map