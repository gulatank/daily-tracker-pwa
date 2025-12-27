type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  id?: number;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, any>;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs
  private dbName = 'DailyTrackerLogs';
  private storeName = 'logs';

  constructor() {
    this.initDB();
  }

  private async initDB() {
    try {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('level', 'level', { unique: false });
        }
      };
    } catch (error) {
      console.error('Failed to initialize log database:', error);
    }
  }

  private async saveToDB(entry: LogEntry) {
    try {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        store.add(entry);

        // Clean up old logs (keep only last maxLogs)
        const index = store.index('timestamp');
        const countRequest = store.count();
        countRequest.onsuccess = () => {
          if (countRequest.result > this.maxLogs) {
            const cursorRequest = index.openCursor(null, 'next');
            cursorRequest.onsuccess = (event) => {
              const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
              if (cursor && countRequest.result - this.maxLogs > 0) {
                cursor.delete();
                cursor.continue();
              }
            };
          }
        };
      };
    } catch (error) {
      console.error('Failed to save log to database:', error);
    }
  }

  private log(level: LogLevel, message: string, context?: string, error?: Error, metadata?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      metadata,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    // Also log to console
    const consoleMethod = level === 'error' ? console.error : 
                          level === 'warn' ? console.warn : 
                          level === 'debug' ? console.debug : 
                          console.log;
    consoleMethod(`[${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}`, error || metadata || '');

    // Save to in-memory array
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Save to IndexedDB
    this.saveToDB(entry);
  }

  info(message: string, context?: string, metadata?: Record<string, any>) {
    this.log('info', message, context, undefined, metadata);
  }

  warn(message: string, context?: string, error?: Error, metadata?: Record<string, any>) {
    this.log('warn', message, context, error, metadata);
  }

  error(message: string, context?: string, error?: Error, metadata?: Record<string, any>) {
    this.log('error', message, context, error, metadata);
  }

  debug(message: string, context?: string, metadata?: Record<string, any>) {
    this.log('debug', message, context, undefined, metadata);
  }

  async getAllLogs(): Promise<LogEntry[]> {
    return new Promise((resolve) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          resolve(this.logs);
          return;
        }
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('timestamp');
        const getAllRequest = index.getAll();
        
        getAllRequest.onsuccess = () => {
          const logs = getAllRequest.result as LogEntry[];
          // Convert timestamp strings back to Date objects
          const processedLogs = logs.map(log => ({
            ...log,
            timestamp: log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp as any)
          }));
          resolve(processedLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        };
        
        getAllRequest.onerror = () => {
          resolve(this.logs);
        };
      };
      
      request.onerror = () => {
        resolve(this.logs);
      };
    });
  }

  async exportLogs(): Promise<string> {
    const logs = await this.getAllLogs();
    const logText = logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const errorInfo = log.error ? `\n  Error: ${log.error.name}: ${log.error.message}${log.error.stack ? `\n  Stack: ${log.error.stack}` : ''}` : '';
      const metadata = log.metadata ? `\n  Metadata: ${JSON.stringify(log.metadata, null, 2)}` : '';
      return `[${timestamp}] [${log.level.toUpperCase()}] ${log.context ? `[${log.context}] ` : ''}${log.message}${errorInfo}${metadata}`;
    }).join('\n\n');
    
    return logText;
  }

  async downloadLogs() {
    const logText = await this.exportLogs();
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-tracker-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async clearLogs() {
    return new Promise<void>((resolve) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          this.logs = [];
          resolve();
          return;
        }
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          this.logs = [];
          resolve();
        };
        clearRequest.onerror = () => resolve();
      };
      request.onerror = () => resolve();
    });
  }
}

export const loggerService = new LoggerService();
export type { LogEntry };

