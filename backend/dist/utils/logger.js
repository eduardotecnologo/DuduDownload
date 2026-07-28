const prefix = '[downloadmp3-backend]';
export const logger = {
    info: (message, details) => {
        console.info(prefix, message, details ?? '');
    },
    warn: (message, details) => {
        console.warn(prefix, message, details ?? '');
    },
    error: (message, details) => {
        console.error(prefix, message, details ?? '');
    }
};
