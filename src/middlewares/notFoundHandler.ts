import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
    res.status(404);

    if (req.accepts('html')) {
        return res.render('errors/404', { title: '404 - Sayfa Bulunamadı' });
    }

    if (req.accepts('json')) {
        return res.json({ success: false, error: 'Bulunamadı.' });
    }

    return res.type('txt').send('404 Not Found');
};