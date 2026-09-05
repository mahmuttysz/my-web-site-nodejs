import express from 'express';
import homePageRouter from './home';
import blogRouter from './blog';
import contactRouter from './contact';
import rssRouter from './rss';

const router = express.Router();

router.use(rssRouter);
router.use('/blog', blogRouter);
router.use('/contact', contactRouter);
router.use('/', homePageRouter);

export default router;
