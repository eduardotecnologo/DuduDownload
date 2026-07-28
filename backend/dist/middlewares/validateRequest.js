import { HttpError } from '../utils/errors.js';
export const validateBody = (schema) => {
    return (request, _response, next) => {
        const result = schema.safeParse(request.body);
        if (!result.success) {
            next(new HttpError('Payload inválido.', 400, result.error.flatten()));
            return;
        }
        request.body = result.data;
        next();
    };
};
