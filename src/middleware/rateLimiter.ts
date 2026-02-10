import type { Request, Response, NextFunction } from 'express';
import redis from '../config/redis.js';

const WINDOW = 60;
const LIMIT = 10;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    if (!ip) return res.status(400).json({ error: 'IP not found' });

    const key = `rate_limit:${ip}`;
    const now = Date.now();

    const results = await redis.pipeline()
      .zadd(key, now, now.toString())
      .zremrangebyscore(key, 0, now - WINDOW * 1000)
      .zcard(key)
      .zrange(key, 0, 0)
      .expire(key, WINDOW)
      .exec();

    const count = (results?.[2]?.[1] as number) || 0;
    const oldest = parseInt((results?.[3]?.[1] as string[])?.[0] ?? '') || now;
    const remaining = Math.max(0, LIMIT - count);
    const retryAfter = Math.max(1, Math.ceil((oldest + WINDOW * 1000 - now) / 1000));

    res.setHeader('X-RateLimit-Limit', LIMIT);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (count > LIMIT) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too Many Requests',
        retry_after: retryAfter,
      });
    }

    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error);
    next();
  }
};
