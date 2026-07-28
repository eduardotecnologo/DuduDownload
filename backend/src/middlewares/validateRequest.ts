import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';
import { HttpError } from '../utils/errors.js';

export const validateBody = <T>(schema: ZodSchema<T>) => {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(new HttpError('Payload inválido.', 400, result.error.flatten()));
      return;
    }

    request.body = result.data as Request['body'];
    next();
  };
};
