import { Router } from 'express';
import type { HealthController } from '../controllers/healthController.js';

export const createHealthRoutes = (controller: HealthController): Router => {
  const router = Router();
  router.get('/', controller.health);
  return router;
};
