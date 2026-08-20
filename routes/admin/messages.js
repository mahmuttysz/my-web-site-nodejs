const express = require('express');
const router = express.Router();
const { pool, dbQueries } = require('../../config/db');

router.get('/', async (req, res) => {
    try {
        const messages = await pool.query(dbQueries.contacts.getAll);
        await pool.query(dbQueries.contacts.markedAsRead);

        return res.render('admin/messages', {
            title: 'Gelen Mesajlar',
            user: req.session.adminUser,
            messages
        });
    } catch (err) {
        console.error('Mesajlar listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.post('/delete/:id', async (req, res) => {
    try {
        await pool.query(dbQueries.contacts.delete, [req.params.id]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;