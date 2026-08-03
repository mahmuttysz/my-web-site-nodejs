const { createClient } = require('redis');
const { env } = require('./env');

let clientOptions = {
    url: env.REDIS_URL || 'redis://127.0.0.1:6379'
};
if (env.APP_ENV === 'dev') clientOptions.RESP = 2;

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