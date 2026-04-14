const { Redis } = require('@upstash/redis');

// Initialize Redis client with Upstash credentials
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache helper functions
const cache = {
  // Get data from cache
  async get(key) {
    try {
      const data = await redis.get(key);
      return data;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  },

  // Set data in cache with TTL (in seconds)
  async set(key, value, ttl = 3600) {
    try {
      await redis.set(key, value, { ex: ttl });
      return true;
    } catch (error) {
      console.error('Redis set error:', error);
      return false;
    }
  },

  // Delete data from cache
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error('Redis delete error:', error);
      return false;
    }
  },

  // Clear all cache matching pattern
  async clearPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error('Redis clear pattern error:', error);
      return false;
    }
  },

  // Generate cache key
  generateKey(prefix, ...parts) {
    return `${prefix}:${parts.join(':')}`;
  },
};

module.exports = { redis, cache };
