const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const BLOG_POSTS = [
  { slug: 'top-10-free-online-tools-2024', title: 'Top 10 Free Online Tools You Need in 2024', excerpt: 'Discover the most useful free online tools that can boost your productivity.', category: 'Productivity', featured: true, date: '2024-01-15', readTime: '5 min', tags: ['tools', 'productivity', 'free'] },
  { slug: 'how-to-compress-images-without-losing-quality', title: 'How to Compress Images Without Losing Quality', excerpt: 'Learn professional techniques to reduce image file sizes while maintaining visual quality.', category: 'Image', featured: true, date: '2024-02-10', readTime: '7 min', tags: ['image', 'compression', 'webp'] },
  { slug: 'pdf-tools-guide', title: 'Complete Guide to PDF Tools', excerpt: 'Everything you need to know about working with PDF files online.', category: 'PDF', featured: false, date: '2024-03-05', readTime: '10 min', tags: ['pdf', 'merge', 'split'] },
  { slug: 'web-security-best-practices', title: 'Web Security Best Practices for 2024', excerpt: 'Protect yourself online with these essential security practices and tools.', category: 'Security', featured: true, date: '2024-03-20', readTime: '8 min', tags: ['security', 'password', 'privacy'] },
  { slug: 'seo-tools-for-beginners', title: 'SEO Tools for Beginners: A Complete Guide', excerpt: 'Start your SEO journey with these powerful free tools and techniques.', category: 'SEO', featured: false, date: '2024-04-01', readTime: '12 min', tags: ['seo', 'marketing', 'beginners'] },
];

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
