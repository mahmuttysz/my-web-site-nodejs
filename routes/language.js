const express = require('express');
const router = express.Router();

router.get('/:langCode', (req, res) => {
    const langCode = req.params.langCode;
    if (['tr', 'en'].includes(langCode)) {
        res.cookie('lang', langCode, { maxAge: 30 * 24 * 60 * 60 * 1000 });
    }

    res.redirect(req.get('referer') || '/');
});

module.exports = router;