import { Router } from 'express';
export const createHealthRoutes = (controller) => {
    const router = Router();
    router.get('/', controller.health);
    return router;
};
