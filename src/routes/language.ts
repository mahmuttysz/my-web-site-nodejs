import express from 'express';
import { switchLanguage } from '../controllers/languageController';

const router = express.Router();

router.get('/:langCode', switchLanguage);

export default router;