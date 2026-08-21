import { Router } from 'express';
import upload from '../../config/upload';
import {
    getAllArticles,
    getArticleById,
    createArticle,
    updateArticle,
    deleteArticle
} from '../../controllers/admin/articlesController';

const router = Router();

router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.post('/create', upload.single('cover_image'), createArticle);
router.post('/edit/:id', upload.single('cover_image'), updateArticle);
router.post('/delete/:id', deleteArticle);

export default router;