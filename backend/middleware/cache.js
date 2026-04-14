const { cache } = require('../redis');

/**
 * Cache middleware factory
 * @param {string} prefix - Cache key prefix
 * @param {number} ttl - Time to live in seconds (default: 3600)
 * @param {function} keyGenerator - Optional custom key generator function
 * @returns {function} Express middleware
 */
const cacheMiddleware = (prefix, ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : cache.generateKey(prefix, req.path, JSON.stringify(req.query));

    try {
      // Try to get from cache
      const cachedData = await cache.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json to cache the response
      res.json = function(data) {
        // Only cache successful responses
        if (data && data.success !== false) {
          cache.set(cacheKey, data, ttl).catch(err => {
            console.error('Cache set error:', err);
          });
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Invalidate cache middleware
 * @param {string} pattern - Cache key pattern to invalidate
 * @returns {function} Express middleware
 */
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to invalidate cache after successful response
    res.json = function(data) {
      // Only invalidate on successful responses
      if (data && data.success !== false) {
        cache.clearPattern(pattern).catch(err => {
          console.error('Cache invalidation error:', err);
        });
      }
      return originalJson(data);
    };

    next();
  };
};

module.exports = { cacheMiddleware, invalidateCache };
