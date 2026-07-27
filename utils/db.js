const mariadb = require('mariadb');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
dotenvExpand.expand(dotenv.config());

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    dateStrings: true
});

const dbTables = {
    aboutMe: {
        getAll: "SELECT * FROM about_me",
        get: "SELECT * FROM about_me WHERE language = ? AND active = 1 LIMIT 1",
        add: "INSERT INTO about_me (title, description, meta_description, created_by, updated_by, language, active) VALUES (?, ?, ?, ?, ?, ?, ?)",
        update: ""
    },
    experiences: {
        getAll: "SELECT * FROM experiences",
        get: "SELECT * FROM experiences WHERE language = ? AND active = 1 ORDER BY begin_date DESC",
        add: "INSERT INTO experiences (company_name, title, description, begin_date, end_date, language, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        update: ""
    },
    projects: {
        getAll: "SELECT * FROM projects",
        get: "SELECT * FROM projects WHERE language = ? AND active = 1 ORDER BY turn ASC",
        add: "INSERT INTO projects () VALUES()",
        update: ""
    },
    socialMedias: {
        getAll: "SELECT * FROM social_medias",
        get: "SELECT * FROM social_medias WHERE active = 1 ORDER BY turn ASC",
        add: "INSERT INTO social_medias () VALUES()",
        update: ""
    },
    contacts: {
        getAll: "SELECT * FROM contacts",
        get: "SELECT * FROM contacts WHERE language = ?",
        add: "INSERT INTO contacts (full_name, email, subject, message, ip, mail_log, language) VALUES (?, ?, ?, ?, ?, ?, ?)",
        update: ""
    }
};

module.exports = { pool, dbTables };