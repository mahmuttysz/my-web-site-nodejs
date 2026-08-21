import { Router } from 'express';
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
} from '../../controllers/admin/projectsController';

const router = Router();

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/create', createProject);
router.post('/edit/:id', updateProject);
router.post('/delete/:id', deleteProject);

export default router;