const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const BLOG_POSTS = [];

router.get('/', (req, res) => {
  const { page = 1, limit = 10, category, featured } = req.query;
  let posts = [...BLOG_POSTS];

  if (category) posts = posts.filter(p => p.category.toLowerCase() === category.toLowerCase());
  if (featured !== undefined) posts = posts.filter(p => p.featured === (featured === 'true'));

  const start = (parseInt(page) - 1) * parseInt(limit);
  const paginated = posts.slice(start, start + parseInt(limit));

  res.json({ success: true, result: { posts: paginated, total: posts.length, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(posts.length / parseInt(limit)) } });
});

router.get('/categories', (req, res) => {
  const categories = [...new Set(BLOG_POSTS.map(p => p.category))];
  res.json({ success: true, result: { categories } });
});

router.get('/search', (req, res) => {
  const { q = '' } = req.query;
  const query = q.toLowerCase();
  const results = BLOG_POSTS.filter(p =>
    p.title.toLowerCase().includes(query) ||
    p.excerpt.toLowerCase().includes(query) ||
    p.tags.some(t => t.includes(query))
  );
  res.json({ success: true, result: { posts: results, total: results.length, query: q } });
});

router.get('/category/:category', (req, res) => {
  const posts = BLOG_POSTS.filter(p => p.category.toLowerCase() === req.params.category.toLowerCase());
  res.json({ success: true, result: { posts, category: req.params.category } });
});

router.get('/:slug', (req, res) => {
  const post = BLOG_POSTS.find(p => p.slug === req.params.slug);
  if (!post) return res.status(404).json({ success: false, error: 'Post not found' });
  res.json({ success: true, result: { post: { ...post, content: `<h1>${post.title}</h1><p>${post.excerpt}</p><p>Full blog content would be loaded here from markdown files.</p>` } } });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
