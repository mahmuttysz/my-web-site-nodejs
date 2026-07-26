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

const sqlCommand = {
    insert: {
        contact: "INSERT INTO contacts (full_name, email, subject, message, ip, mail_log, language) VALUES (?, ?, ?, ?, ?, ?, ?)"
    },
    select: {
        aboutMe: "SELECT * FROM about_me WHERE language = ? AND active = 1 LIMIT 1",
        experiences: "SELECT * FROM experiences WHERE language = ? ORDER BY begin_date DESC",
        projects: "SELECT * FROM projects WHERE language = ? AND active = 1 ORDER BY turn ASC",
        socialMedias: "SELECT * FROM social_medias WHERE active = 1 ORDER BY turn ASC"
    }
}

module.exports = { pool, sqlCommand };