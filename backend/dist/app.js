import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createHealthRoutes } from './routes/healthRoutes.js';
import { createDownloadRoutes } from './routes/downloadRoutes.js';
import { createHistoryRoutes } from './routes/historyRoutes.js';
import { createSettingsRoutes } from './routes/settingsRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
export const createApp = (dependencies) => {
    const app = express();
    app.use(helmet());
    app.use(cors({
        origin: dependencies.frontendUrl,
        credentials: true
    }));
    app.use(express.json({ limit: '10mb' }));
    app.use('/api/health', createHealthRoutes(dependencies.healthController));
    app.use('/api/downloads', createDownloadRoutes(dependencies.downloadController));
    app.use('/api/history', createHistoryRoutes(dependencies.historyController));
    app.use('/api/settings', createSettingsRoutes(dependencies.settingsController));
    app.get('/api', (_request, response) => {
        response.json({ success: true, data: { name: 'DownloadMP3 API' } });
    });
    app.use(notFoundHandler);
    app.use(errorHandler);
    return app;
};
