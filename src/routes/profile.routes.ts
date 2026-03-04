import { Router } from 'express';
import { createProfile } from '../controllers/profile.controller';
import { validate } from '../middlewares/validate.middleware';
import { createProfileSchema } from '../types/profile/schema';

const router = Router();

// POST /api/profiles
// Notice the flow: Request -> Validation Middleware -> Controller
router.post('/', validate(createProfileSchema), createProfile);

export default router;