// src/config/db.ts
import mariadb, { Pool } from 'mariadb';
import { env } from './env';

export const pool: Pool = mariadb.createPool({
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT || '3306', 10),
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME,
    connectionLimit: 10,
    dateStrings: true,
    idleTimeout: 30,
    minimumIdle: 0
});

const cols = {
    adminUsers:
        'id, name, surname, username, type, wrong_try, last_wrong_try, last_success_login, ip, status, created_at, updated_at, deleted_at',
    adminUsersAuth:
        'id, name, surname, username, password_hash, type, wrong_try, last_wrong_try, last_success_login, ip, status, created_at, updated_at, deleted_at',
    aboutMe:
        'id, title, description, now_text, meta_description, created_by, updated_by, language, status, created_at, updated_at',
    experiences:
        'id, company_name, title, description, begin_date, end_date, language, created_by, updated_by, status, created_at, updated_at',
    projects:
        'id, title, description, link_text, link_url, tags, turn, language, created_by, updated_by, status, created_at, updated_at',
    socialMedias:
        'id, title, username, url, icon, turn, created_by, updated_by, status, created_at, updated_at',
    contacts:
        'id, subject, full_name, email, message, ip, language, is_read, created_at',
    articles:
        'id, title, excerpt, content, slug, preview_token, cover_image, hits, language, created_by, updated_by, reading_time, status, published_at, created_at, updated_at'
} as const;

export const dbQueries = {
    adminUsers: {
        getAll: `SELECT ${cols.adminUsers} FROM admin_users`,
        getById: `SELECT ${cols.adminUsers} FROM admin_users WHERE id = ?`,
        getByUsername: `SELECT ${cols.adminUsersAuth} FROM admin_users WHERE username = ?`,
        getActiveByUsername: `SELECT ${cols.adminUsersAuth} FROM admin_users WHERE username = ? AND status = 1`,
        add: "INSERT INTO admin_users (name, surname, username, password_hash) VALUES (?, ?, ?, ?)",
        update: "UPDATE admin_users SET name = ?, surname = ?, username = ?, password_hash = ? WHERE id = ?",
        wrongTryUpdate: "UPDATE admin_users SET last_wrong_try = ?, wrong_try = wrong_try + 1, ip = ? WHERE id = ?",
        resetWrongTry: "UPDATE admin_users SET wrong_try = 0, last_wrong_try = NULL WHERE id = ?",
        successLoginUpdate: "UPDATE admin_users SET last_success_login = ?, wrong_try = 0, ip = ? WHERE id = ?",
        delete: "DELETE FROM admin_users WHERE id = ?"
    },
    aboutMe: {
        getAll: `SELECT ${cols.aboutMe} FROM about_me`,
        get: `SELECT ${cols.aboutMe} FROM about_me WHERE language = ? AND status = 1`,
        add: "INSERT INTO about_me (title, description, meta_description, created_by, language, status) VALUES (?, ?, ?, ?, ?, ?)",
        update: "UPDATE about_me SET title = ?, description = ?, now_text = ?, meta_description = ?, updated_by = ? WHERE language = ?",
        delete: "DELETE FROM about_me WHERE id = ?"
    },
    experiences: {
        getAll: `SELECT ${cols.experiences} FROM experiences ORDER BY created_at DESC`,
        get: `SELECT ${cols.experiences} FROM experiences WHERE language = ? AND status = 1 ORDER BY (end_date IS NULL) DESC, end_date DESC, begin_date DESC`,
        getById: `SELECT ${cols.experiences} FROM experiences WHERE id = ?`,
        add: "INSERT INTO experiences (company_name, title, description, begin_date, end_date, language, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE experiences SET company_name = ?, title = ?, description = ?, begin_date = ?, end_date = ?, language = ?, updated_by = ?, status = ? WHERE id = ?",
        delete: "DELETE FROM experiences WHERE id = ?"
    },
    projects: {
        getAll: `SELECT ${cols.projects} FROM projects ORDER BY created_at DESC`,
        get: `SELECT ${cols.projects} FROM projects WHERE language = ? AND status = 1 ORDER BY turn ASC`,
        getById: `SELECT ${cols.projects} FROM projects WHERE id = ?`,
        add: "INSERT INTO projects (title, link_text, link_url, description, tags, turn, language, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE projects SET title = ?, link_text = ?, link_url = ?, description = ?, tags = ?, turn = ?, language = ?, updated_by = ?, status = ? WHERE id = ?",
        delete: "DELETE FROM projects WHERE id = ?"
    },
    socialMedias: {
        getAll: `SELECT ${cols.socialMedias} FROM social_medias ORDER BY turn ASC`,
        get: `SELECT ${cols.socialMedias} FROM social_medias WHERE status = 1 ORDER BY turn ASC`,
        getById: `SELECT ${cols.socialMedias} FROM social_medias WHERE id = ?`,
        add: "INSERT INTO social_medias (title, username, url, icon, turn, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE social_medias SET title = ?, username = ?, url = ?, icon = ?, turn = ?, updated_by = ?, status = ? WHERE id = ?",
        delete: "DELETE FROM social_medias WHERE id = ?"
    },
    contacts: {
        getAll: `SELECT ${cols.contacts} FROM contacts ORDER BY is_read ASC, created_at DESC`,
        getLastFive: `SELECT ${cols.contacts} FROM contacts ORDER BY created_at DESC LIMIT 5`,
        get: `SELECT ${cols.contacts} FROM contacts WHERE language = ?`,
        add: "INSERT INTO contacts (full_name, email, subject, message, ip, mail_log, language) VALUES (?, ?, ?, ?, ?, ?, ?)",
        updateMailLog: "UPDATE contacts SET mail_log = ? WHERE id = ?",
        update: "UPDATE contacts SET is_read = 1 WHERE id = ?",
        delete: "DELETE FROM contacts WHERE id = ?"
    },
    articles: {
        getAll: `SELECT ${cols.articles} FROM articles ORDER BY created_at DESC`,
        get: `SELECT ${cols.articles} FROM articles WHERE language = ? AND status = 1 ORDER BY COALESCE(published_at, created_at) DESC`,
        getById: `SELECT ${cols.articles} FROM articles WHERE id = ? LIMIT 1`,
        getBySlug: `SELECT ${cols.articles} FROM articles WHERE slug = ? AND language = ? AND status = 1 LIMIT 1`,
        getByLangSlug: `SELECT ${cols.articles} FROM articles WHERE slug = ? AND language = ? LIMIT 1`,
        getPublishedOtherLang: "SELECT slug, language FROM articles WHERE slug = ? AND language <> ? AND status = 1 LIMIT 1",
        getSitemap: "SELECT slug, language, created_at, updated_at, published_at FROM articles WHERE status = 1 ORDER BY COALESCE(published_at, created_at) DESC",
        getRss: "SELECT title, slug, excerpt, content, language, published_at, created_at, updated_at FROM articles WHERE language = ? AND status = 1 ORDER BY COALESCE(published_at, created_at) DESC LIMIT 50",
        add: "INSERT INTO articles (title, slug, excerpt, content, cover_image, created_by, status, reading_time, published_at, language, preview_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        update: "UPDATE articles SET title = ?, slug = ?, excerpt = ?, content = ?, cover_image = ?, status = ?, updated_by = ?, reading_time = ?, published_at = ?, language = ? WHERE id = ?",
        addHits: "UPDATE articles SET hits = hits + ? WHERE id = ?",
        setPreviewToken: "UPDATE articles SET preview_token = ? WHERE id = ?",
        getByPreviewToken: `SELECT ${cols.articles} FROM articles WHERE preview_token = ? LIMIT 1`,
        delete: "DELETE FROM articles WHERE id = ?"
    }
} as const;

export const adminPanel = {
    dashboard: `SELECT 
      (SELECT COUNT(*) FROM articles) AS totalArticles,
      (SELECT COALESCE(SUM(hits), 0) FROM articles) AS totalViews,
      (SELECT COUNT(*) FROM contacts WHERE is_read = 0) AS unreadMessages
  `
} as const;

// Generic query wrapper: Dönüş tipini çağıran noktada belirtmeye olanak tanır
export const queryOne = async <T>(sql: string, params?: any[]): Promise<T | null> => {
    const rows = await pool.query<T[]>(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
};

export const query = async <T = any>(sql: string, params: any[] = []): Promise<T> => {
    return (await pool.query(sql, params)) as T;
};

export const closePool = async (): Promise<void> => {
    console.log('MariaDB havuz bağlantıları kapatılıyor...');
    await pool.end();
};