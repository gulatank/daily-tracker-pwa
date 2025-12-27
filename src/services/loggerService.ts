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
    return new Promise<void>((resolve) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onerror = () => {
        console.error('Failed to open database for saving log');
        resolve(); // Don't reject, just fail silently
      };
      
      request.onsuccess = () => {
        const db = request.result;
        
        // Check if store exists, if not, we need to upgrade
        if (!db.objectStoreNames.contains(this.storeName)) {
          // Store doesn't exist, need to upgrade
          db.close();
          const upgradeRequest = indexedDB.open(this.dbName, 2);
          upgradeRequest.onupgradeneeded = (event) => {
            const upgradeDb = (event.target as IDBOpenDBRequest).result;
            if (!upgradeDb.objectStoreNames.contains(this.storeName)) {
              const store = upgradeDb.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
              store.createIndex('timestamp', 'timestamp', { unique: false });
              store.createIndex('level', 'level', { unique: false });
            }
          };
          upgradeRequest.onsuccess = () => {
            const upgradeDb = upgradeRequest.result;
            const transaction = upgradeDb.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            // Convert Date to ISO string for storage
            const entryToSave = {
              ...entry,
              timestamp: entry.timestamp.toISOString()
            };
            store.add(entryToSave);
            resolve();
          };
          upgradeRequest.onerror = () => resolve();
          return;
        }
        
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        // Convert Date to ISO string for storage
        const entryToSave = {
          ...entry,
          timestamp: entry.timestamp.toISOString()
        };
        
        const addRequest = store.add(entryToSave);
        addRequest.onsuccess = () => {
          // Clean up old logs (keep only last maxLogs)
          const countRequest = store.count();
          countRequest.onsuccess = () => {
            if (countRequest.result > this.maxLogs) {
              const index = store.index('timestamp');
              const cursorRequest = index.openCursor(null, 'next');
              let deletedCount = 0;
              cursorRequest.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor && deletedCount < (countRequest.result - this.maxLogs)) {
                  cursor.delete();
                  deletedCount++;
                  cursor.continue();
                } else {
                  resolve();
                }
              };
              cursorRequest.onerror = () => resolve();
            } else {
              resolve();
            }
          };
          countRequest.onerror = () => resolve();
        };
        addRequest.onerror = () => resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('level', 'level', { unique: false });
        }
      };
    });
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
      
      request.onerror = () => {
        console.error('Failed to open database for reading logs');
        resolve(this.logs); // Return in-memory logs as fallback
      };
      
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          console.log('Log store does not exist yet');
          resolve(this.logs);
          return;
        }
        
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const logs = getAllRequest.result as any[];
          // Convert timestamp strings back to Date objects
          const processedLogs = logs.map(log => ({
            ...log,
            timestamp: typeof log.timestamp === 'string' ? new Date(log.timestamp) : (log.timestamp instanceof Date ? log.timestamp : new Date())
          }));
          const sortedLogs = processedLogs.sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
            const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
            return timeB - timeA;
          });
          console.log(`Loaded ${sortedLogs.length} logs from database`);
          resolve(sortedLogs);
        };
        
        getAllRequest.onerror = () => {
          console.error('Failed to get logs from database');
          resolve(this.logs);
        };
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

