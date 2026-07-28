import http from 'node:http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { initDatabase } from './db/database.js';
import { createApp } from './app.js';
import { DownloadService } from './services/DownloadService.js';
import { HistoryService } from './services/HistoryService.js';
import { SettingsService } from './services/SettingsService.js';
import { QueueService } from './services/QueueService.js';
import { MetadataService } from './services/MetadataService.js';
import { DownloadController } from './controllers/downloadController.js';
import { HealthController } from './controllers/healthController.js';
import { HistoryController } from './controllers/historyController.js';
import { SettingsController } from './controllers/settingsController.js';
import { logger } from './utils/logger.js';
initDatabase();
const settingsService = new SettingsService();
const historyService = new HistoryService();
const downloadService = new DownloadService();
const metadataService = new MetadataService();
const queueService = new QueueService(downloadService, historyService, settingsService);
const downloadController = new DownloadController(queueService, metadataService);
const healthController = new HealthController();
const historyController = new HistoryController(historyService);
const settingsController = new SettingsController(settingsService, queueService);
const app = createApp({
    downloadController,
    healthController,
    historyController,
    settingsController,
    frontendUrl: env.frontendUrl
});
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: env.frontendUrl,
        credentials: true
    }
});
queueService.attachSocket(io);
io.on('connection', (socket) => {
    socket.emit('queue:changed', queueService.getJobs());
    socket.on('download:subscribe', (jobId) => {
        const job = queueService.getJob(jobId);
        if (job) {
            socket.emit('download:started', job);
        }
    });
    socket.on('download:unsubscribe', () => {
        // No-op for now.
    });
});
httpServer.listen(env.port, () => {
    logger.info(`Servidor disponível em http://localhost:${env.port}`);
});
