import { createClient, RedisClientOptions } from 'redis';
import { env } from './env';

const clientOptions: RedisClientOptions = {
    url: env.REDIS_URL || 'redis://127.0.0.1:6379',
    socket: {
        reconnectStrategy: (retries: number): number | Error => {
            if (retries > 10) {
                console.error('❌ Redis: Maksimum yeniden bağlanma denemesi aşıldı.');
                return new Error('Redis bağlantısı sağlanamadı.');
            }
            return Math.min(retries * 200, 3000);
        }
    }
};

if (env.APP_ENV === 'dev') {
    (clientOptions as any).RESP = 2;
}

const redisClient = createClient(clientOptions);

redisClient.on('error', (err: Error) => {
    console.error('❌ Redis Bağlantı Hatası:', err.message);
});

redisClient.on('connect', () => {
    console.log('🔴 Redis oturum sunucusuna başarıyla bağlanıldı.');
});

redisClient.on('reconnecting', () => {
    console.warn('⚠️ Redis sunucusuna yeniden bağlanılıyor...');
});

(async (): Promise<void> => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('❌ Redis Başlatma Hatası:', err);
    }
})();

export default redisClient;