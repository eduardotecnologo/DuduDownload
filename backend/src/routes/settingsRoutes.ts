import { Router } from 'express';
import type { SettingsController } from '../controllers/settingsController.js';

export const createSettingsRoutes = (controller: SettingsController): Router => {
  const router = Router();

  router.get('/', controller.getSettings);
  router.put('/', controller.updateSettings);

  return router;
};
