import { z } from 'zod';
import { HttpError } from '../utils/errors.js';
const settingsSchema = z.object({
    defaultDownloadPath: z.string().min(1),
    theme: z.enum(['light', 'dark', 'system']),
    maxConcurrentDownloads: z.number().int().min(1).max(8),
    autoUpdateYtDlp: z.boolean(),
    autoUpdateFfmpeg: z.boolean()
});
export class SettingsController {
    settingsService;
    queueService;
    constructor(settingsService, queueService) {
        this.settingsService = settingsService;
        this.queueService = queueService;
    }
    getSettings = (_request, response) => {
        response.json({ success: true, data: { settings: this.settingsService.getSettings() } });
    };
    updateSettings = (request, response) => {
        const result = settingsSchema.safeParse(request.body);
        if (!result.success) {
            throw new HttpError('Configurações inválidas.', 400, result.error.flatten());
        }
        const settings = this.settingsService.updateSettings(result.data);
        this.queueService.setConcurrency(settings.maxConcurrentDownloads);
        response.json({ success: true, data: { settings } });
    };
}
