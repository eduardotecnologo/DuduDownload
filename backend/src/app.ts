import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createHealthRoutes } from './routes/healthRoutes.js';
import { createDownloadRoutes } from './routes/downloadRoutes.js';
import { createHistoryRoutes } from './routes/historyRoutes.js';
import { createSettingsRoutes } from './routes/settingsRoutes.js';
import type { DownloadController } from './controllers/downloadController.js';
import type { HealthController } from './controllers/healthController.js';
import type { HistoryController } from './controllers/historyController.js';
import type { SettingsController } from './controllers/settingsController.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

export interface CreateAppDependencies {
  downloadController: DownloadController;
  healthController: HealthController;
  historyController: HistoryController;
  settingsController: SettingsController;
  frontendUrl: string;
}

export const createApp = (dependencies: CreateAppDependencies) => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: dependencies.frontendUrl,
      credentials: true
    })
  );
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
