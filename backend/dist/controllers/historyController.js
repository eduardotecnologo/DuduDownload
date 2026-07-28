import { z } from 'zod';
import { HttpError } from '../utils/errors.js';
import { openPath } from '../utils/opener.js';
const querySchema = z.object({
    search: z.string().optional(),
    format: z.enum(['mp3', 'm4a', 'mp4', 'mkv', 'webm']).optional(),
    limit: z.coerce.number().min(1).max(200).optional(),
    offset: z.coerce.number().min(0).optional()
});
export class HistoryController {
    historyService;
    constructor(historyService) {
        this.historyService = historyService;
    }
    listHistory = (request, response) => {
        const result = querySchema.safeParse(request.query);
        if (!result.success) {
            throw new HttpError('Filtros inválidos.', 400, result.error.flatten());
        }
        const history = this.historyService.list(result.data);
        response.json({ success: true, data: history });
    };
    deleteHistory = (request, response) => {
        const id = Number(request.params.id);
        if (!Number.isFinite(id)) {
            throw new HttpError('ID inválido.', 400);
        }
        this.historyService.delete(id);
        response.status(204).send();
    };
    clearHistory = (_request, response) => {
        this.historyService.clear();
        response.status(204).send();
    };
    openOutputPath = async (request, response) => {
        const outputPath = request.body?.outputPath;
        if (!outputPath) {
            throw new HttpError('Caminho de saída não informado.', 400);
        }
        await openPath(outputPath);
        response.json({ success: true, data: { opened: true } });
    };
}
