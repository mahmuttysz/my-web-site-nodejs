import { Router } from 'express';
import { getAboutMe, updateAboutMe } from '../../controllers/admin/aboutMeController';

const router = Router();

router.get('/', getAboutMe);
router.post('/:lang', updateAboutMe);

export default router;