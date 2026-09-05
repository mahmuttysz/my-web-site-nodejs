import express from 'express';
import homePageRouter from './home';
import blogRouter from './blog';
import contactRouter from './contact';
import rssRouter from './rss';
import siteMapRouter from './siteMap';

const router = express.Router();

router.use(siteMapRouter);
router.use(rssRouter);
router.use('/blog', blogRouter);
router.use('/contact', contactRouter);
router.use('/', homePageRouter);

export default router;
