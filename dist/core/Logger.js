/**
 * Logger system for engine debugging and monitoring
 */
export class Logger {
    constructor(enableDebug = false) {
        this.logHistory = [];
        this.maxHistorySize = 1000;
        this.enableDebug = enableDebug;
    }
    /**
     * Log debug message
     */
    debug(message, ...args) {
        if (this.enableDebug) {
            this.log('DEBUG', message, ...args);
        }
    }
    /**
     * Log info message
     */
    info(message, ...args) {
        this.log('INFO', message, ...args);
    }
    /**
     * Log warning message
     */
    warn(message, ...args) {
        this.log('WARN', message, ...args);
    }
    /**
     * Log error message
     */
    error(message, ...args) {
        this.log('ERROR', message, ...args);
    }
    /**
     * Internal logging method
     */
    log(level, message, ...args) {
        const entry = {
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
    getHistory() {
        return [...this.logHistory];
    }
    /**
     * Get logs by level
     */
    getLogsByLevel(level) {
        return this.logHistory.filter(entry => entry.level === level);
    }
    /**
     * Clear log history
     */
    clearHistory() {
        this.logHistory.length = 0;
    }
    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
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
//# sourceMappingURL=Logger.js.map