const express = require('express');
const router = express.Router();
const { pool, dbQueries, adminPanel } = require('../../config/db');

router.get('/', async (req, res) => {
    try {
        const [[stats], recentMessages] = await Promise.all([
            pool.query(adminPanel.dashboard),
            pool.query(dbQueries.contacts.getLastFive)
        ]);

        return res.render('admin/dashboard', {
            title: 'Dashboard',
            user: req.session.adminUser,
            stats: {
                totalArticles: Number(stats?.totalArticles || 0),
                totalViews: Number(stats?.totalViews || 0),
                unreadMessages: Number(stats?.unreadMessages || 0)
            },
            recentMessages: recentMessages || []
        });

    } catch (err) {
        console.error('Dashboard yükleme hatası:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

module.exports = router;