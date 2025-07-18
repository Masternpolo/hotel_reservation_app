// import { createClient } from 'redis';
// const redisClient = createClient({url: 'redis://localhost:6379'});
// redisClient.on('error', err => console.log('Redis Client Error', err));
// await redisClient.connect();
// export default redisClient;

// redisClient.js (or .ts if using TypeScript)

import { createClient } from 'redis';

let redisClient;

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

if (REDIS_URL) {
  redisClient = createClient({
    url: REDIS_URL,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
  });

  (async () => {
    try {
      await redisClient.connect();
      console.log('✅ Redis connected');
    } catch (err) {
      console.warn('Redis connection failed:', err.message);
    }
  })();
} else {
  console.log('No Redis URL provided, skipping Redis connection.');
}

export default redisClient;
