const { env } = require('../config/env');

const verifyTurnstile = async (req, res, next) => {
    const token = req.body['cf-turnstile-response'];

    if (!token) {
        return res.status(400).json({
            success: false,
            message: res.locals.t.form.verifyHuman
        });
    }

    try {
        const formData = new URLSearchParams();
        formData.append('secret', env.TURNSTILE_SECRET_KEY);
        formData.append('response', token);
        if (req.ip) formData.append('remoteip', req.ip);

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const outcome = await response.json();

        if (!outcome.success) {
            return res.status(400).json({
                success: false,
                message: res.locals.t.form.securityVerificationError
            });
        }
        
        next();
    } catch (err) {
        console.error('Turnstile Middleware Hatası:', err);
        return res.status(500).json({
            success: false,
            message: res.locals.t.form.serverVerificationError
        });
    }
};

module.exports = verifyTurnstile;