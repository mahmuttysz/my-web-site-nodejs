const { env } = require('../config/env');

module.exports = {
    isAdmin: (req, res, next) => {
        const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

        if (req.session && req.session.adminUser) {
            return next();
        }

        const isAjax = req.xhr ||
            req.headers.accept?.includes('json') ||
            req.headers['x-requested-with'] === 'XMLHttpRequest';

        if (isAjax) {
            return res.status(401).json({
                success: false,
                message: 'Oturum süreniz doldu. Lütfen yeniden giriş yapın.'
            });
        }

        if (req.originalUrl && !req.originalUrl.includes('/login') && !req.originalUrl.includes('/logout')) {
            req.session.returnTo = req.originalUrl;
        }

        return res.redirect(`${adminEndpoint}/login`);
    }
};