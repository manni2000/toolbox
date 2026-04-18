const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const cache = {
  async get(key) {
    try {
      const data = await redis.get(key);
      return data;
    } catch (error) {
      // console.error('Redis get error:', error);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    try {
      await redis.set(key, value, { ex: ttl });
      return true;
    } catch (error) {
      // console.error('Redis set error:', error);
      return false;
    }
  },

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      // console.error('Redis delete error:', error);
      return false;
    }
  },

  async clearPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      // console.error('Redis clear pattern error:', error);
      return false;
    }
  },

  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  },
};

module.exports = { redis, cache };
