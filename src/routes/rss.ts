import express from 'express';
import { generateRss } from '../controllers/rssController';

const router = express.Router();

router.get('/rss.xml', generateRss);

export default router;
