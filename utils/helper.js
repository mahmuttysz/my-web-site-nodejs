const getIndexPageData = async (lang = 'tr') => {
    const { pool, dbTables } = require('../config/db');

    const aboutMe = await pool.query(dbTables.aboutMe.get, [lang]) || [];
    const experiences = await pool.query(dbTables.experiences.get, [lang]) || [];
    const projects = await pool.query(dbTables.projects.get, [lang]) || [];
    const articles = await pool.query(dbTables.articles.get, [lang]) || [];
    const socialMedias = await pool.query(dbTables.socialMedias.get) || [];

    return { aboutMe: aboutMe[0] || {}, experiences, projects, articles, socialMedias };
};

const formatDate = (dateString, lang = 'tr') => {
    if (!dateString) return lang === 'tr' ? 'Devam Ediyor' : 'Ongoing';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    let formatted = date.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        month: 'long',
        year: 'numeric'
    });

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatLongDate = (dateString, lang = 'tr') => {
    const date = new Date(dateString);
    let formatted = new Date(date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatLongDateTime = (dateString, lang = 'tr') => {
    const date = new Date(dateString);
    let formatted = new Date(date).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });

    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const escapeHtml = (text) => {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

// Tahmini okuma süresi hesaplama (Kelime sayısı / 200)
const calculateReadingTime = (content) => {
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / 200) || 1;
};

module.exports = {
    getIndexPageData,
    formatDate,
    formatLongDate,
    formatLongDateTime,
    escapeHtml,
    calculateReadingTime
};