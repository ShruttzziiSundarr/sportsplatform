import { Router } from 'express';
import { createProfile, getProfile, listProfiles } from '../controllers/profile.controller';
import { addMetrics } from '../controllers/metrics.controller';
import { validate } from '../middlewares/validate.middleware';
import { addMetricsSchema, createProfileSchema } from '../types/profile/schema';

const router = Router();

// Profile endpoints
router.get('/',     listProfiles);
router.get('/:id',  getProfile);
router.post('/',    validate(createProfileSchema), createProfile);

// Metrics endpoint: POST /api/profiles/:id/metrics
// Adds a new session record and triggers MiniGPT scout report refresh
router.post('/:id/metrics', validate(addMetricsSchema), addMetrics);

export default router;