const prefix = '[downloadmp3-backend]';

export const logger = {
  info: (message: string, details?: unknown) => {
    console.info(prefix, message, details ?? '');
  },
  warn: (message: string, details?: unknown) => {
    console.warn(prefix, message, details ?? '');
  },
  error: (message: string, details?: unknown) => {
    console.error(prefix, message, details ?? '');
  }
};