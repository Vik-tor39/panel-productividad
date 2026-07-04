import { Router } from 'express';
import { requireAuth, requireRole, requireAdmin } from '../middleware/auth.js';
import { summary, admin, global } from '../controllers/statsController.js';

export const statsRouter = Router();

statsRouter.get('/stats/summary', requireAuth, requireRole('user'), summary);
statsRouter.get('/stats/admin', requireAuth, requireRole('admin'), admin);
statsRouter.get('/stats/global', requireAuth, requireAdmin, global);
