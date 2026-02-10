import express from 'express';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After');
  if (req.method === 'OPTIONS') return void res.sendStatus(200);
  next();
});

app.use(rateLimiter);

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'OK' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
