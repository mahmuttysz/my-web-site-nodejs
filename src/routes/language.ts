import { Router } from 'express';
import { changeLanguage } from '../controllers/languageController';

const router = Router();

router.get('/:langCode', changeLanguage);

export default router;
