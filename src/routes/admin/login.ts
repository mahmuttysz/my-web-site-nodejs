import { Router } from 'express';
import { checkAuthStatus, login, logout } from '../../controllers/admin/authController';
import { formLimiter } from '../../config/rate-limit';

const router = Router();

router.get('/', checkAuthStatus);
router.post('/', formLimiter, login);
router.get('/destroy', logout);

export default router;