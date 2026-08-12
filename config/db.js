const mariadb = require('mariadb');
const { env } = require('./env');

const pool = mariadb.createPool({
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    connectionLimit: 10,
    dateStrings: true,
    idleTimeout: 30,
    minimumIdle: 0
});

const dbTables = {
    adminUsers: {
        getAll: "SELECT * FROM admin_users",
        getById: "SELECT * FROM admin_users WHERE id = ?",
        getByUsername: "SELECT * FROM admin_users WHERE username = ?",
        add: "INSERT INTO admin_users (name, surname, username, password_hash) VALUES (?, ?, ?, ?)",
        update: "UPDATE admin_users SET name = ?, surname = ?, username = ?, password_hash = ? WHERE id = ?",
        wrongTryUpdate: "UPDATE admin_users SET last_wrong_try = ?, wrong_try = wrong_try + 1, ip = ? WHERE id = ?",
        successLoginUpdate: "UPDATE admin_users SET last_success_login = ?, ip = ? WHERE id = ?",
        delete: "DELETE FROM admin_users WHERE id = ?"
    },
    aboutMe: {
        getAll: "SELECT * FROM about_me",
        get: "SELECT * FROM about_me WHERE language = ? AND status = 1 LIMIT 1",
        add: "INSERT INTO about_me (title, description, meta_description, created_by, language, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE about_me SET title = ?, description = ?, meta_description = ?, updated_by = ?, language = ?, status = ? WHERE id = ?",
        delete: "DELETE FROM about_me WHERE id = ?"
    },
    experiences: {
        getAll: "SELECT * FROM experiences ORDER BY created_at DESC",
        get: "SELECT * FROM experiences WHERE language = ? AND status = 1 ORDER BY begin_date DESC",
        add: "INSERT INTO experiences (company_name, title, description, begin_date, end_date, language, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE experiences SET company_name = ?, title = ?, description = ?, begin_date = ?, end_date = ?, language = ?, updated_by = ? WHERE id = ?",
        delete: "DELETE FROM experiences WHERE id = ?"
    },
    projects: {
        getAll: "SELECT * FROM projects ORDER BY created_at DESC",
        get: "SELECT * FROM projects WHERE language = ? AND status = 1 ORDER BY turn ASC",
        add: "INSERT INTO projects (title, description, link_text, link_url, created_by, tags, turn, language, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE projects SET title = ?, description = ?, link_text = ?, link_url = ?, tags = ?, turn = ?, language = ?, updated_by = ? WHERE id = ?",
        delete: "DELETE FROM projects WHERE id = ?"
    },
    socialMedias: {
        getAll: "SELECT * FROM social_medias ORDER BY turn ASC",
        get: "SELECT * FROM social_medias WHERE status = 1 ORDER BY turn ASC",
        add: "INSERT INTO social_medias (title, username, url, icon, turn, status) VALUES (?, ?, ?, ?, ?, ?)",
        update: "UPDATE social_medias SET title = ?, username = ?, url = ?, icon = ?, turn = ?, status = ? WHERE id = ?",
        delete: "DELETE FROM social_medias WHERE id = ?"
    },
    contacts: {
        getAll: "SELECT * FROM contacts ORDER BY created_at DESC",
        getLastFive: "SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5",
        get: "SELECT * FROM contacts WHERE language = ?",
        add: "INSERT INTO contacts (full_name, email, subject, message, ip, mail_log, language) VALUES (?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE contacts SET is_read = 1 WHERE id = ?",
        markedAsRead: "UPDATE contacts SET is_read = 1",
        delete: "DELETE FROM contacts WHERE id = ?"
    },
    articles: {
        getAll: "SELECT * FROM articles ORDER BY created_at DESC",
        get: "SELECT * FROM articles WHERE language = ? AND status = 1 ORDER BY created_at DESC",
        getById: "SELECT * FROM articles WHERE id = ?",
        getBySlug: "SELECT * FROM articles WHERE slug = ? AND language = ? AND status = 1",
        add: "INSERT INTO articles (title, slug, excerpt, content, cover_image, created_by, status, reading_time, published_at, language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE articles SET title = ?, slug = ?, excerpt = ?, content = ?, status = ?, updated_by = ?, reading_time = ?, language = ?",
        updateHits: "UPDATE articles SET hits = hits + 1 WHERE id = ?",
        delete: "DELETE FROM articles WHERE id = ?"
    }
};

const adminPanel = {
    dashboard: `SELECT 
        (SELECT COUNT(*) FROM articles) AS totalArticles,
        (SELECT COALESCE(SUM(hits), 0) FROM articles) AS totalViews,
        (SELECT COUNT(*) FROM contacts WHERE is_read = 0) AS unreadMessages
    `
};

const gracefulShutdown = async () => {
    try {
        await pool.end();
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { pool, dbTables, adminPanel };