import { isDevelopment } from '../constants';

const isDev = isDevelopment();

export interface Logger {
  log: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  group: (label: string) => void;
  groupEnd: () => void;
}

/**
 * logger object
 *
 * @example
 * ```typescript
 * import { logger } from '@lunasis/shared/utils';
 *
 * logger.log('일반 로그');
 * logger.info('정보 로그');
 * logger.warn('경고 로그');
 * logger.error('에러 로그');
 * logger.debug('디버그 로그');
 *
 * logger.group('그룹 시작');
 * logger.log('그룹 내 로그');
 * logger.groupEnd();
 * ```
 */
export const logger: Logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },

  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  error: (...args: unknown[]) => {
    console.error(...args);
  },

  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },

  group: (label: string) => {
    if (isDev) console.group(label);
  },

  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
};

/**
 * create conditional logger
 * create a logger that logs only under specific conditions
 *
 * @param condition - logging condition
 * @returns conditional logger
 *
 * @example
 * ```typescript
 * const debugLogger = createConditionalLogger(DEBUG_MODE);
 * debugLogger.log('Only output in debug mode.');
 * ```
 */
export function createConditionalLogger(condition: boolean): Logger {
  return {
    log: (...args: unknown[]) => {
      if (condition) console.log(...args);
    },
    info: (...args: unknown[]) => {
      if (condition) console.info(...args);
    },
    warn: (...args: unknown[]) => {
      if (condition) console.warn(...args);
    },
    error: (...args: unknown[]) => {
      if (condition) console.error(...args);
    },
    debug: (...args: unknown[]) => {
      if (condition) console.debug(...args);
    },
    group: (label: string) => {
      if (condition) console.group(label);
    },
    groupEnd: () => {
      if (condition) console.groupEnd();
    },
  };
}

/**
 * log level
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * create level logger
 * create a logger that logs only under specific levels
 *
 * @param minLevel - minimum log level
 * @returns level logger
 *
 * @example
 * ```typescript
 * const prodLogger = createLevelLogger(LogLevel.ERROR);
 * prodLogger.log('출력 안됨');
 * prodLogger.error('출력됨');
 * ```
 */
export function createLevelLogger(minLevel: LogLevel): Logger {
  return {
    log: (...args: unknown[]) => {
      if (minLevel <= LogLevel.DEBUG) console.log(...args);
    },
    info: (...args: unknown[]) => {
      if (minLevel <= LogLevel.INFO) console.info(...args);
    },
    warn: (...args: unknown[]) => {
      if (minLevel <= LogLevel.WARN) console.warn(...args);
    },
    error: (...args: unknown[]) => {
      if (minLevel <= LogLevel.ERROR) console.error(...args);
    },
    debug: (...args: unknown[]) => {
      if (minLevel <= LogLevel.DEBUG) console.debug(...args);
    },
    group: (label: string) => {
      if (minLevel <= LogLevel.DEBUG) console.group(label);
    },
    groupEnd: () => {
      if (minLevel <= LogLevel.DEBUG) console.groupEnd();
    },
  };
}
