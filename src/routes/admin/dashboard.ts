import { Router } from 'express';
import { getDashboard } from '../../controllers/admin/dashboardController';

const router = Router();

router.get('/', getDashboard);

export default router;