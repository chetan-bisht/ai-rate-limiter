import type { Request, Response, NextFunction } from 'express';
import redis from '../config/redis.js';

const WINDOW_SIZE_IN_SECONDS = 60;
const MAX_WINDOW_REQUEST_COUNT = 10;
const WINDOW_LOG_INTERVAL_IN_HOURS = 1;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (!ip) {
        res.status(400).json({ error: 'IP address not found' });
        return; 
    }

    const key = `rate_limit:${ip}`;
    const currentTimestamp = Date.now();
    const windowStartTimestamp = currentTimestamp - (WINDOW_SIZE_IN_SECONDS * 1000);

    const pipeline = redis.pipeline();
    pipeline.zadd(key, currentTimestamp, currentTimestamp.toString());
    pipeline.zremrangebyscore(key, 0, windowStartTimestamp);
    pipeline.zcard(key);
    pipeline.expire(key, WINDOW_LOG_INTERVAL_IN_HOURS * 60 * 60);

    const results = await pipeline.exec();

    let requestCount = 0;
    if (results && results.length >= 3 && results[2] && results[2][1] !== undefined) {
      requestCount = results[2][1] as number;
    }

    res.setHeader('X-RateLimit-Limit', MAX_WINDOW_REQUEST_COUNT);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_WINDOW_REQUEST_COUNT - requestCount));

    if (requestCount > MAX_WINDOW_REQUEST_COUNT) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have exceeded the 10 requests per minute limit.',
        retry_after: 'Wait a moment before trying again.'
      });
      return;
    }

    next();

  } catch (error) {
    console.error('Rate Limiter Error:', error);
    next();
  }
};