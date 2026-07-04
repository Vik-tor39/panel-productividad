import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { summary, admin } from '../controllers/statsController.js';

export const statsRouter = Router();

statsRouter.get('/stats/summary', requireAuth, requireRole('user'), summary);
statsRouter.get('/stats/admin', requireAuth, requireRole('admin'), admin);
