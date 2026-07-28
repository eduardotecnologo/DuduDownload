import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import type { HistoryController } from '../controllers/historyController.js';

export const createHistoryRoutes = (controller: HistoryController): Router => {
  const router = Router();

  router.get('/', controller.listHistory);
  router.delete('/:id', controller.deleteHistory);
  router.delete('/', controller.clearHistory);
  router.post('/open', asyncHandler(controller.openOutputPath));

  return router;
};
