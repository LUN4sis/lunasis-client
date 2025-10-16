/**
 * logger utility
 * development: all logs output
 * production: only error logs output
 */

const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  error: (...args: unknown[]) => {
    // always output error logs (production monitoring)
    console.error(...args);
  },
};
