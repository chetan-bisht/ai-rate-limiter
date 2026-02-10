import express from 'express';
import redis from './config/redis.js';
import { rateLimiter } from './middleware/rateLimiter.js';
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(rateLimiter);

app.get('/', async (req, res) => {

  await redis.set('test_key', 'Hello from Docker!');
  const value = await redis.get('test_key');
  
  res.json({
    message: 'API Rate Limiter System',
    redis_status: value ? 'Connected & Working' : 'Failed',
    value_from_redis: value
  });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});