const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisClient = new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: 3
  }
);

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
});

async function connectRedis() {
  return new Promise((resolve, reject) => {
    redisClient.on('ready', resolve);
    redisClient.on('error', reject);
  });
}

// Cache helper functions
const cache = {
  async get(key) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key, value, expiryInSeconds = 3600) {
    await redisClient.setex(key, expiryInSeconds, JSON.stringify(value));
  },

  async del(key) {
    await redisClient.del(key);
  },

  async delPattern(pattern) {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  cache
};
