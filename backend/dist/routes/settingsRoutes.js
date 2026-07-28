import { Router } from 'express';
export const createSettingsRoutes = (controller) => {
    const router = Router();
    router.get('/', controller.getSettings);
    router.put('/', controller.updateSettings);
    return router;
};
