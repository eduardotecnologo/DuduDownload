import { z } from 'zod';
import type { Request, Response } from 'express';
import type { HistoryService } from '../services/HistoryService.js';
import { HttpError } from '../utils/errors.js';
import type { DownloadFormat } from '../types/download.js';
import { openPath } from '../utils/opener.js';

const querySchema = z.object({
  search: z.string().optional(),
  format: z.enum(['mp3', 'm4a', 'mp4', 'mkv', 'webm']).optional(),
  limit: z.coerce.number().min(1).max(200).optional(),
  offset: z.coerce.number().min(0).optional()
});

export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  listHistory = (request: Request, response: Response): void => {
    const result = querySchema.safeParse(request.query);
    if (!result.success) {
      throw new HttpError('Filtros inválidos.', 400, result.error.flatten());
    }

    const history = this.historyService.list(result.data as { search?: string; format?: DownloadFormat; limit?: number; offset?: number });
    response.json({ success: true, data: history });
  };

  deleteHistory = (request: Request, response: Response): void => {
    const id = Number(request.params.id);
    if (!Number.isFinite(id)) {
      throw new HttpError('ID inválido.', 400);
    }

    this.historyService.delete(id);
    response.status(204).send();
  };

  clearHistory = (_request: Request, response: Response): void => {
    this.historyService.clear();
    response.status(204).send();
  };

  openOutputPath = async (request: Request, response: Response): Promise<void> => {
    const outputPath = request.body?.outputPath as string | undefined;
    if (!outputPath) {
      throw new HttpError('Caminho de saída não informado.', 400);
    }

    await openPath(outputPath);
    response.json({ success: true, data: { opened: true } });
  };
}
