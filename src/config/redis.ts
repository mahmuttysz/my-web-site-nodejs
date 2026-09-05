// src/config/redis.ts
import { createClient } from 'redis';
import { env } from './env';

const clientOptions: any = {
    url: env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        reconnectStrategy: (retries: number) => {
            if (retries > 10) {
                console.error('❌ Redis: Maksimum yeniden bağlanma denemesi aşıldı.');
                return new Error('Redis bağlantısı sağlanamadı.');
            }
            return Math.min(retries * 200, 3000);
        }
    }
};

if (env.APP_ENV === 'dev') {
    clientOptions.RESP = 2;
}

const redisClient = createClient(clientOptions);

redisClient.on('error', (err: any) => {
    console.error('❌ Redis Bağlantı Hatası:', err?.message || err);
});

redisClient.on('connect', () => {
    console.log('🔴 Redis oturum sunucusuna başarıyla bağlanıldı.');
});

redisClient.on('reconnecting', () => {
    console.warn('⚠️ Redis sunucusuna yeniden bağlanılıyor...');
});

export const closeRedis = async (): Promise<void> => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
};

(async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('❌ Redis Başlatma Hatası:', err);
    }
})();

export default redisClient;