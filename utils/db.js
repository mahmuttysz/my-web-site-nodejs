const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

const sqlCommand = {
    insert: {
        contact: "INSERT INTO contacts (full_name, email, subject, message, ip, language) VALUES (?, ?, ?, ?, ?, ?)"
    },
    select: {
        aboutMe: "SELECT * FROM about_me WHERE language = ? LIMIT 1",
        experiences: "SELECT * FROM experiences WHERE language = ? ORDER BY begin_date DESC"
    }
}

module.exports = { pool, sqlCommand };