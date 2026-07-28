import { HttpError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
export const notFoundHandler = (request, response, next) => {
    next(new HttpError(`Rota não encontrada: ${request.method} ${request.originalUrl}`, 404));
};
export const errorHandler = (error, _request, response, next) => {
    void next;
    if (error instanceof HttpError) {
        response.status(error.statusCode).json({
            success: false,
            error: error.message,
            details: error.details ?? null
        });
        return;
    }
    const message = error instanceof Error ? error.message : 'Erro interno inesperado.';
    logger.error(message, error);
    response.status(500).json({
        success: false,
        error: message
    });
};
