const { env } = require('../config/env');

module.exports = {
    isAdmin: (req, res, next) => {
        if (req.session && req.session.adminUser) {
            return next();
        }
        return res.redirect(`${env.ADMIN_PANEL_ENDPOINT || '/admin'}/login`);
    }
};