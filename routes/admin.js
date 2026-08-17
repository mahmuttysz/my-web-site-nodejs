const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const slugify = require('slugify');
const fs = require('fs/promises');
const path = require('path');

const { env } = require('../config/env');
const { pool, dbQueries, adminPanel } = require('../config/db');
const upload = require('../config/upload');
const { formLimiter } = require('../config/rateLimit');
const { isAdmin } = require('../middleware/auth');
const { calculateReadingTime, safeTrim, formatDate } = require('../utils/helper');

const adminEndpoint = env.ADMIN_PANEL_ENDPOINT || '/admin';

router.get('/login', (req, res) => {
    if (req.session.adminUser) return res.redirect(adminEndpoint);
    return res.render('admin/login', { adminEndpoint, error: null });
});

router.post('/login', formLimiter, async (req, res) => {
    const { username, password } = req.body;

    try {
        const clientIp = req.headers['cf-connecting-ip'] ||
            req.headers['x-forwarded-for']?.split(',')[0] ||
            req.ip;

        const user = await pool.query(dbQueries.adminUsers.getByUsername, [username]);

        if (!user || user.length === 0) {
            return res.render('admin/login', { adminEndpoint, error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        const match = await bcrypt.compare(password, user[0].password_hash);

        if (!match) {
            await pool.query(dbQueries.adminUsers.wrongTryUpdate, [new Date(), clientIp, user[0].id]);
            return res.render('admin/login', { adminEndpoint, error: 'Kullanıcı adı veya şifre hatalı.' });
        }

        req.session.adminUser = {
            id: user[0].id,
            username: user[0].username
        };

        await pool.query(dbQueries.adminUsers.successLoginUpdate, [new Date(), clientIp, user[0].id]);

        const redirectUrl = req.session.returnTo || adminEndpoint;
        delete req.session.returnTo;

        return res.redirect(redirectUrl);

    } catch (err) {
        console.error('Login Hatası:', err);
        return res.render('admin/login', { adminEndpoint, error: 'Veritabanı hatası oluştu.' });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect(`${adminEndpoint}/login`);
    });
});

router.get('/', isAdmin, async (req, res) => {
    try {
        const [[stats], recentMessages] = await Promise.all([
            pool.query(adminPanel.dashboard),
            pool.query(dbQueries.contacts.getLastFive)
        ]);

        return res.render('admin/dashboard', {
            title: 'Dashboard',
            adminEndpoint,
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

router.get('/about-me', isAdmin, async (req, res) => {
    try {
        const aboutMe = await pool.query(dbQueries.aboutMe.getAll);

        return res.render('admin/about-me', {
            title: 'Hakkımda',
            adminEndpoint,
            user: req.session.adminUser,
            aboutMe
        });
    } catch (err) {
        console.error('Hakkımda sayfası hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.post('/about-me/:lang', isAdmin, async (req, res) => {
    try {
        let lang = req.params.lang;
        const { title, meta_description, description } = req.body;
        await pool.query(dbQueries.aboutMe.update, [
            safeTrim(title),
            safeTrim(description),
            safeTrim(meta_description),
            req.session.adminUser?.id,
            lang
        ]);
        return res.redirect(`${adminEndpoint}/about-me`);
    } catch (err) {
        console.error('Hakkımda sayfası hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/projects', isAdmin, async (req, res) => {
    try {
        let projects = await pool.query(dbQueries.projects.getAll);

        projects?.forEach((f, i) => {
            let tags = JSON.parse(f.tags);

            f.tags = tags;
        });

        return res.render('admin/projects/index', {
            title: 'Projelerim',
            adminEndpoint,
            user: req.session.adminUser,
            projects
        });
    } catch (err) {
        console.error('Projeler listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/projects/new', isAdmin, (req, res) => {
    return res.render('admin/projects/editor', {
        title: 'Yeni Proje',
        adminEndpoint,
        user: req.session.adminUser,
        project: {}
    });
});

router.post('/projects/create', isAdmin, async (req, res) => {
    const { title, link_text, link_url, description, tags, turn, language, status } = req.body;
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }
        let tagEdit = "[";
        let tagSplit = tags.trim().split(',');
        if (tagSplit && tagSplit.length > 1) {
            tagSplit.forEach((tag, i) => {
                if (tagSplit.length - 1 !== i)
                    tagEdit += "\"" + tag.trim() + "\", ";
                else
                    tagEdit += "\"" + tag.trim() + "\"";
            });
            tagEdit += "]";
        } else {
            tagEdit = "[]";
        }

        await pool.query(dbQueries.projects.add, [
            safeTrim(title),
            safeTrim(link_text),
            safeTrim(link_url),
            safeTrim(description),
            tagEdit,
            turnCnv,
            language || 'tr',
            req.session.adminUser?.id,
            projectStatus
        ]);

        return res.redirect(`${adminEndpoint}/projects`);

    } catch (err) {
        console.error('Proje ekleme hatası:', err);

        let errorMessage = 'Proje kaydedilirken bir hata oluştu.';
        if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/projects/editor', {
            title: 'Yeni Proje',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            project: req.body
        });
    }
});

router.get('/projects/edit/:id', isAdmin, async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.projects.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${adminEndpoint}/projects`);
        }
        let project = rows[0];
        let tagsTxt = "";
        let tagParse = JSON.parse(project.tags || "[]");
        tagParse.forEach((tag, i) => {
            if (tagParse.length - 1 !== i)
                tagsTxt += tag + ", ";
            else
                tagsTxt += tag;
        });
        project.tagsTxt = tagsTxt;
        return res.render('admin/projects/editor', {
            title: 'Proje Düzenle',
            adminEndpoint,
            user: req.session.adminUser,
            project
        });
    } catch (err) {
        console.error('Proje getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/projects`);
    }
});

router.post('/projects/edit/:id', isAdmin, async (req, res) => {
    const projectId = req.params.id;
    const { title, link_text, link_url, description, tags, turn, status, language } = req.body;
    const projectStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    let tagEdit = "[";
    let tagSplit = tags.trim().split(',');
    if (tagSplit && tagSplit.length > 1) {
        tagSplit.forEach((tag, i) => {
            if (tagSplit.length - 1 !== i)
                tagEdit += "\"" + tag.trim() + "\", ";
            else
                tagEdit += "\"" + tag.trim() + "\"";
        });
        tagEdit += "]";
    } else {
        tagEdit = "[]";
    }

    try {
        await pool.query(dbQueries.projects.update, [
            safeTrim(title),
            safeTrim(link_text),
            safeTrim(link_url),
            safeTrim(description),
            tagEdit,
            turnCnv,
            language || 'tr',
            req.session.adminUser?.id,
            projectStatus,
            projectId
        ]);

        return res.redirect(`${adminEndpoint}/projects`);

    } catch (err) {
        console.error('Proje güncelleme hatası:', err);
        let errorMessage = 'Proje güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/projects/editor', {
            title: 'Proje Düzenle',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            project: { ...req.body, id: projectId }
        });
    }
});

router.post('/projects/delete/:id', isAdmin, async (req, res) => {
    try {
        const projectId = req.params.id;

        await pool.query(dbQueries.projects.delete, [projectId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/experiences', isAdmin, async (req, res) => {
    try {
        const experiences = await pool.query(dbQueries.experiences.getAll);

        return res.render('admin/experiences/index', {
            title: 'Projelerim',
            adminEndpoint,
            user: req.session.adminUser,
            experiences
        });
    } catch (err) {
        console.error('Deneyimler listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/experiences/new', isAdmin, (req, res) => {
    return res.render('admin/experiences/editor', {
        title: 'Yeni Deneyim',
        adminEndpoint,
        user: req.session.adminUser,
        experience: { begin_date: new Date().toISOString().split('T')[0] }
    });
});

router.post('/experiences/create', isAdmin, async (req, res) => {
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body;
    const experienceStatus = parseInt(status, 10) || 0;
    const endDate = isResume === 'true' ? null : end_date;

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }

        await pool.query(dbQueries.experiences.add, [
            safeTrim(company_name),
            safeTrim(title),
            safeTrim(description),
            begin_date,
            endDate,
            language || 'tr',
            req.session.adminUser?.id,
            experienceStatus
        ]);

        return res.redirect(`${adminEndpoint}/experiences`);

    } catch (err) {
        console.error('Deneyim ekleme hatası:', err);

        let errorMessage = 'Deneyim kaydedilirken bir hata oluştu.';
        if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/experiences/editor', {
            title: 'Yeni Deneyim',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            project: req.body
        });
    }
});

router.get('/experiences/edit/:id', isAdmin, async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.experiences.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${adminEndpoint}/experiences`);
        }

        return res.render('admin/experiences/editor', {
            title: 'Deneyim Düzenle',
            adminEndpoint,
            user: req.session.adminUser,
            experience: rows[0]
        });
    } catch (err) {
        console.error('Proje getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/projects`);
    }
});

router.post('/experiences/edit/:id', isAdmin, async (req, res) => {
    const experienceId = req.params.id;
    const { company_name, title, description, begin_date, isResume, end_date, language, status } = req.body;
    const experienceStatus = parseInt(status, 10) || 0;
    const endDate = isResume === 'true' ? null : end_date;

    try {
        await pool.query(dbQueries.experiences.update, [
            safeTrim(company_name),
            safeTrim(title),
            safeTrim(description),
            begin_date,
            endDate,
            language || 'tr',
            req.session.adminUser?.id,
            experienceStatus,
            experienceId
        ]);

        return res.redirect(`${adminEndpoint}/experiences`);

    } catch (err) {
        console.error('Deneyim güncelleme hatası:', err);
        let errorMessage = 'Deneyim güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/experiences/editor', {
            title: 'Deneyim Düzenle',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            experience: { ...req.body, id: experienceId }
        });
    }
});

router.post('/experiences/delete/:id', isAdmin, async (req, res) => {
    try {
        const experienceId = req.params.id;

        await pool.query(dbQueries.experiences.delete, [experienceId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/social-medias', isAdmin, async (req, res) => {
    try {
        const socialMedias = await pool.query(dbQueries.socialMedias.getAll);

        return res.render('admin/social-medias/index', {
            title: 'Sosyal Medyalar',
            adminEndpoint,
            user: req.session.adminUser,
            socialMedias
        });
    } catch (err) {
        console.error('Sosyal medyalar listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/social-medias/new', isAdmin, (req, res) => {
    return res.render('admin/social-medias/editor', {
        title: 'Yeni Sosyal Medya',
        adminEndpoint,
        user: req.session.adminUser,
        socialMedia: {}
    });
});

router.post('/social-medias/create', isAdmin, async (req, res) => {
    const { title, username, url, icon, turn, status } = req.body;
    const sMediaStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    try {
        if (!title) {
            throw new Error('Başlık alanı zorunludur.');
        }

        await pool.query(dbQueries.socialMedias.add, [
            safeTrim(title),
            safeTrim(username),
            safeTrim(url),
            safeTrim(icon),
            turnCnv,
            req.session.adminUser?.id,
            sMediaStatus
        ]);

        return res.redirect(`${adminEndpoint}/social-medias`);

    } catch (err) {
        console.error('Sosyal medya ekleme hatası:', err);

        let errorMessage = 'Sosyal medya kaydedilirken bir hata oluştu.';
        if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/social-medias/editor', {
            title: 'Yeni Sosyal Medya',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            project: req.body
        });
    }
});

router.get('/social-medias/edit/:id', isAdmin, async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.socialMedias.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${adminEndpoint}/social-medias`);
        }
        return res.render('admin/social-medias/editor', {
            title: 'Sosyal Medya Düzenle',
            adminEndpoint,
            user: req.session.adminUser,
            socialMedia: rows[0]
        });
    } catch (err) {
        console.error('Proje getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/social-medias`);
    }
});

router.post('/social-medias/edit/:id', isAdmin, async (req, res) => {
    const sMediaId = req.params.id;
    const { title, username, url, icon, turn, status } = req.body;
    const sMediaStatus = parseInt(status, 10) || 0;
    const turnCnv = parseInt(turn, 10) || 11;

    try {
        await pool.query(dbQueries.socialMedias.update, [
            safeTrim(title),
            safeTrim(username),
            safeTrim(url),
            safeTrim(icon),
            turnCnv,
            req.session.adminUser?.id,
            sMediaStatus,
            sMediaId
        ]);

        return res.redirect(`${adminEndpoint}/social-medias`);

    } catch (err) {
        console.error('Sosyal medya güncelleme hatası:', err);
        let errorMessage = 'Sosyal medya güncellenirken bir hata oluştu.';

        return res.status(400).render('admin/social-medias/editor', {
            title: 'Sosyal Medya Düzenle',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            project: { ...req.body, id: sMediaId }
        });
    }
});

router.post('/social-medias/delete/:id', isAdmin, async (req, res) => {
    try {
        const sMediaId = req.params.id;

        await pool.query(dbQueries.socialMedias.delete, [sMediaId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/messages', isAdmin, async (req, res) => {
    try {
        const messages = await pool.query(dbQueries.contacts.getAll);
        await pool.query(dbQueries.contacts.markedAsRead);

        return res.render('admin/messages', {
            title: 'Gelen Mesajlar',
            adminEndpoint,
            user: req.session.adminUser,
            messages
        });
    } catch (err) {
        console.error('Mesajlar listelenirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.post('/messages/delete/:id', isAdmin, async (req, res) => {
    try {
        await pool.query(dbQueries.contacts.delete, [req.params.id]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/articles', isAdmin, async (req, res) => {
    try {
        const articles = await pool.query(dbQueries.articles.getAll);
        return res.render('admin/articles/index', {
            title: 'Makaleler',
            adminEndpoint,
            user: req.session.adminUser,
            articles
        });
    } catch (err) {
        console.error('Makaleler çekilirken hata:', err);
        return res.status(500).send('Sunucu hatası');
    }
});

router.get('/articles/new', isAdmin, (req, res) => {
    return res.render('admin/articles/editor', {
        title: 'Yeni Makale',
        adminEndpoint,
        user: req.session.adminUser,
        article: {}
    });
});

router.post('/articles/create', isAdmin, (req, res, next) => {
    upload.single('cover_image')(req, res, (err) => {
        if (err) {
            console.error('Dosya yükleme hatası:', err.message);
            return res.status(400).render('admin/articles/editor', {
                error: err.message,
                adminEndpoint,
                user: req.session.adminUser,
                article: req.body
            });
        }
        next();
    });
}, async (req, res) => {
    const { title, slug, excerpt, content, status, language } = req.body;
    const articleStatus = parseInt(status, 10) || 0;
    const cover_image = req.file ? `/uploads/articles/${req.file.filename}` : null;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: language });
    const readingTime = calculateReadingTime(content);
    const publishedAt = articleStatus === 1 ? new Date() : null;

    try {
        if (!title || !content) {
            throw new Error('Başlık ve içerik alanları zorunludur.');
        }

        await pool.query(dbQueries.articles.add, [
            safeTrim(title),
            safeTrim(finalSlug),
            safeTrim(excerpt),
            safeTrim(content),
            cover_image,
            req.session.adminUser?.id,
            articleStatus,
            readingTime,
            publishedAt,
            language || 'tr'
        ]);

        return res.redirect(`${adminEndpoint}/articles`);

    } catch (err) {
        console.error('Makale ekleme hatası:', err);

        if (req.file) {
            try { await fs.unlink(req.file.path); } catch (e) { }
        }

        let errorMessage = 'Makale kaydedilirken bir hata oluştu.';
        if (err.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Bu başlık veya slug ile zaten kayıtlı bir makale var!';
        } else if (err.message) {
            errorMessage = err.message;
        }

        return res.status(400).render('admin/articles/editor', {
            title: 'Yeni Makale',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            article: req.body
        });
    }
});

router.get('/articles/edit/:id', isAdmin, async (req, res) => {
    try {
        const rows = await pool.query(dbQueries.articles.getById, [req.params.id]);
        if (!rows || rows.length === 0) {
            return res.redirect(`${adminEndpoint}/articles`);
        }

        return res.render('admin/articles/editor', {
            title: 'Makale Düzenle',
            adminEndpoint,
            user: req.session.adminUser,
            article: rows[0]
        });
    } catch (err) {
        console.error('Makale getirme hatası:', err);
        return res.redirect(`${adminEndpoint}/articles`);
    }
});

router.post('/articles/edit/:id', isAdmin, (req, res, next) => {
    upload.single('cover_image')(req, res, (err) => {
        if (err) {
            return res.status(400).render('admin/articles/editor', {
                error: err.message,
                adminEndpoint,
                user: req.session.adminUser,
                article: { ...req.body, id: req.params.id }
            });
        }
        next();
    });
}, async (req, res) => {
    const articleId = req.params.id;
    const { title, slug, excerpt, content, status, language, existing_cover_image } = req.body;

    const articleStatus = parseInt(status, 10) || 0;
    const publishedAt = articleStatus === 1 ? new Date() : null;
    const finalSlug = slugify(slug || title || '', { lower: true, strict: true, locale: 'tr' });
    const readingTime = calculateReadingTime(content);

    let cover_image = existing_cover_image || null;
    if (req.file) {
        cover_image = `/uploads/articles/${req.file.filename}`;
    }

    try {
        await pool.query(dbQueries.articles.update, [
            safeTrim(title),
            safeTrim(finalSlug),
            safeTrim(excerpt),
            safeTrim(content),
            cover_image,
            articleStatus,
            req.session.adminUser?.id,
            readingTime,
            publishedAt,
            language || 'tr',
            articleId
        ]);

        if (req.file && existing_cover_image) {
            const oldImagePath = path.join(__dirname, '../public', existing_cover_image);
            try { await fs.unlink(oldImagePath); } catch (e) { }
        }

        return res.redirect(`${adminEndpoint}/articles`);

    } catch (err) {
        console.error('Makale güncelleme hatası:', err);

        if (req.file) {
            try { await fs.unlink(req.file.path); } catch (e) { }
        }

        let errorMessage = 'Makale güncellenirken bir hata oluştu.';
        if (err.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Bu slug veya başlık başka bir makale tarafından kullanılıyor!';
        }

        return res.status(400).render('admin/articles/editor', {
            title: 'Makale Düzenle',
            error: errorMessage,
            adminEndpoint,
            user: req.session.adminUser,
            article: { ...req.body, id: articleId, cover_image: existing_cover_image }
        });
    }
});

router.post('/articles/delete/:id', isAdmin, async (req, res) => {
    try {
        const articleId = req.params.id;

        const rows = await pool.query(dbQueries.articles.getById, [articleId]);
        if (rows && rows.length > 0 && rows[0].cover_image) {
            const imagePath = path.join(__dirname, '../public', rows[0].cover_image);
            try { await fs.unlink(imagePath); } catch (e) { }
        }

        await pool.query(dbQueries.articles.delete, [articleId]);
        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;