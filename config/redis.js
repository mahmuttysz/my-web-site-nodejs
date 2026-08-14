const { createClient } = require('redis');
const { env } = require('./env');

let clientOptions = {
    url: env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('❌ Redis: Maksimum yeniden bağlanma denemesi aşıldı.');
                return new Error('Redis bağlantısı sağlayanadı.');
            }
            return Math.min(retries * 200, 3000);
        }
    }
};

if (env.APP_ENV === 'dev') {
    clientOptions.RESP = 2;
}

const redisClient = createClient(clientOptions);

redisClient.on('error', (err) => {
    console.error('❌ Redis Bağlantı Hatası:', err.message);
});

redisClient.on('connect', () => {
    console.log('🔴 Redis oturum sunucusuna başarıyla bağlanıldı.');
});

redisClient.on('reconnecting', () => {
    console.warn('⚠️ Redis sunucusuna yeniden bağlanılıyor...');
});

(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('❌ Redis Başlatma Hatası:', err);
    }
})();

module.exports = redisClient;