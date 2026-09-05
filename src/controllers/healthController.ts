import { Request, Response } from 'express';
import { query } from '../config/db';
import redisClient from '../config/redis';
import { probeHealth } from '../utils/health';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
    const payload = await probeHealth({
        pingDb: () => query('SELECT 1 AS ok'),
        pingRedis: async () => {
            if (!redisClient.isOpen) {
                throw new Error('Redis is not connected');
            }
            await redisClient.ping();
        }
    });

    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.status(payload.ok ? 200 : 503).json(payload);
};

export default { getHealth };
