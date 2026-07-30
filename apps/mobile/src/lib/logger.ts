type LogCategory = 'NAVIGATION' | 'NETWORK' | 'AI' | 'BEHAVIOR' | 'FOCUS' | 'AUTH' | 'ERROR';

interface LogEntry {
  id: string;
  timestamp: string;
  category: LogCategory;
  message: string;
  data?: unknown;
}

const MAX_LOGS = 500;
const logs: LogEntry[] = [];

export const logger = {
  log(category: LogCategory, message: string, data?: unknown) {
    if (!__DEV__) return;
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(),
      category,
      message,
      data,
    };
    logs.unshift(entry);
    if (logs.length > MAX_LOGS) logs.pop();
    console.log(`[${category}] ${message}`, data ?? '');
  },
  error(message: string, data?: unknown) {
    this.log('ERROR', message, data);
  },
  getLogs() {
    return [...logs];
  },
  clearLogs() {
    logs.length = 0;
  },
  exportLogs() {
    return JSON.stringify(logs, null, 2);
  },
};
