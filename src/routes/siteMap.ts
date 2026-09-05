import express from 'express';
import { generateSiteMap } from '../controllers/siteMapController';

const router = express.Router();

router.get('/sitemap.xml', generateSiteMap);

export default router;
