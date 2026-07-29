const { createClient } = require('redis');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');
dotenvExpand.expand(dotenv.config());

let clientOptions = {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};
if (process.env.APP_ENV === 'dev') clientOptions.RESP = 2;

const redisClient = createClient(clientOptions);

redisClient.on('error', (err) => {
    console.error('❌ Redis Bağlantı Hatası:', err);
});

redisClient.on('connect', () => {
    console.log('🔴 Redis oturum sunucusuna başarıyla bağlanıldı.');
});

// Asenkron Bağlantı Başlatıcı
(async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
})();

module.exports = redisClient;