const express = require('express');
const router = express.Router();

const { env } = require('../../config/env');
const { isAdmin } = require('../../middleware/auth');

const loginRouter = require('./login');
const dashboardRouter = require('./dashboard');
const aboutMeRouter = require('./about-me');
const articlesRouter = require('./articles');
const experiencesRouter = require('./experiences');
const messagesRouter = require('./messages');
const projectsRouter = require('./projects');
const socialMediasRouter = require('./social-medias');

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

router.use((req, res, next) => {
    res.locals.adminEndpoint = adminEndpoint;
    req.adminEndpoint = adminEndpoint;
    next();
});

router.use('/login', loginRouter);

router.use(isAdmin);

router.use('/about-me', aboutMeRouter);
router.use('/articles', articlesRouter);
router.use('/experiences', experiencesRouter);
router.use('/messages', messagesRouter);
router.use('/projects', projectsRouter);
router.use('/social-medias', socialMediasRouter);
router.use('/', dashboardRouter);

module.exports = router;