import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { receiveEvent } from '../controllers/integrationController.js';

export const integrationRouter = Router();

integrationRouter.post('/integration/receive', requireAuth, receiveEvent);
