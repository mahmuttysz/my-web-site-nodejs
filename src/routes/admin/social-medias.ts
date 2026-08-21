import { Router } from 'express';
import {
    getAllSocialMedias,
    getSocialMediaById,
    createSocialMedia,
    updateSocialMedia,
    deleteSocialMedia
} from '../../controllers/admin/socialMediasController';

const router = Router();

router.get('/', getAllSocialMedias);
router.get('/:id', getSocialMediaById);
router.post('/create', createSocialMedia);
router.post('/edit/:id', updateSocialMedia);
router.post('/delete/:id', deleteSocialMedia);

export default router;