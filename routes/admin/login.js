const express = require('express');
const router = express.Router();
const { pool, dbQueries } = require('../../config/db');
const { formLimiter } = require('../../config/rate-limit');
const bcrypt = require('bcrypt');

router.get('/', (req, res) => {
    if (req.session.adminUser) return res.redirect(req.adminEndpoint);
    return res.render('admin/login', { error: null });
});

router.post('/', formLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;

        const user = await pool.query(dbQueries.adminUsers.getByUsername, [username]);

        if (!user || user.length === 0) {
            return res.render('admin/login', { error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        const match = await bcrypt.compare(password, user[0].password_hash);

        if (!match) {
            await pool.query(dbQueries.adminUsers.wrongTryUpdate, [new Date(), clientIp, user[0].id]);
            return res.render('admin/login', { error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        req.session.adminUser = {
            id: user[0].id,
            username: user[0].username
        };

        await pool.query(dbQueries.adminUsers.successLoginUpdate, [new Date(), clientIp, user[0].id]);

        const redirectUrl = req.session.returnTo || req.adminEndpoint;
        delete req.session.returnTo;

        return res.redirect(redirectUrl);

    } catch (err) {
        console.error('Login Hatası:', err);
        return res.render('admin/login', { error: 'Veritabanı hatası oluştu.' });
    }
});

router.get('/destroy', (req, res) => {
    req.session.destroy(() => {
        res.redirect(`${req.adminEndpoint}/login`);
    });
});

module.exports = router;