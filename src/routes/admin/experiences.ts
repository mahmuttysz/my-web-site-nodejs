import { Router } from 'express';
import {
    getAllExperiences,
    getExperienceById,
    createExperience,
    updateExperience,
    deleteExperience
} from '../../controllers/admin/experiencesController';

const router = Router();

router.get('/', getAllExperiences);
router.get('/:id', getExperienceById);
router.post('/create', createExperience);
router.post('/edit/:id', updateExperience);
router.post('/delete/:id', deleteExperience);

export default router;