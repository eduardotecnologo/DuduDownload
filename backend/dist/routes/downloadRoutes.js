import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
export const createDownloadRoutes = (controller) => {
    const router = Router();
    router.post('/select-folder', asyncHandler(controller.pickFolder));
    router.post('/metadata', asyncHandler(controller.searchMetadata));
    router.post('/', asyncHandler(controller.createDownload));
    router.get('/', controller.listDownloads);
    router.patch('/:jobId/pause', controller.pauseDownload);
    router.patch('/:jobId/resume', controller.resumeDownload);
    router.delete('/:jobId', controller.cancelDownload);
    return router;
};
