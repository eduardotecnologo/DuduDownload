import type { Request, Response } from 'express';

export class HealthController {
  health = (_request: Request, response: Response): void => {
    response.json({ success: true, data: { status: 'ok' } });
  };
}
