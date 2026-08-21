import { Router } from 'express';
import { submitContactForm } from '../controllers/contactController';
import { verifyTurnstile } from '../middleware/turnstile';
import { formLimiter } from '../config/rate-limit';

const router = Router();

router.post('/', formLimiter, verifyTurnstile, submitContactForm);

export default router;