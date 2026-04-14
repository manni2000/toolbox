const express = require('express');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();
router.use(strictLimiter);

router.post('/hashtag-generator', (req, res) => {
  const { topic, niche, count = 30 } = req.body;
  if (!topic) return res.status(400).json({ success: false, error: 'Topic required' });

  const keywords = topic.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  const nicheKeywords = niche ? niche.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean) : [];

  const prefixes = ['best', 'top', 'amazing', 'love', 'inspo', 'tips', 'daily', 'life', 'viral', 'trending'];
  const suffixes = ['life', 'love', 'inspo', 'goals', 'vibes', 'tips', 'hacks', 'ideas', 'style', 'community'];

  const hashtags = new Set();

  for (const kw of keywords) {
    hashtags.add(`#${kw}`);
    for (const s of suffixes.slice(0, 3)) hashtags.add(`#${kw}${s}`);
    for (const p of prefixes.slice(0, 3)) hashtags.add(`#${p}${kw}`);
  }

  for (const nk of nicheKeywords.slice(0, 5)) {
    hashtags.add(`#${nk}`);
    hashtags.add(`#${nk}community`);
  }

  if (keywords.length > 1) hashtags.add(`#${keywords.join('')}`);
  hashtags.add('#viral');
  hashtags.add('#trending');
  hashtags.add('#explore');
  hashtags.add('#fyp');
  hashtags.add('#foryou');

  const result = [...hashtags].slice(0, parseInt(count) || 30);
  res.json({ success: true, result: { hashtags: result, count: result.length, string: result.join(' ') } });
});

router.post('/bio-generator', (req, res) => {
  const { name, profession, skills = [], emoji = true, platform = 'instagram' } = req.body;
  if (!name || !profession) return res.status(400).json({ success: false, error: 'Name and profession required' });

  const skillsStr = Array.isArray(skills) && skills.length ? skills.slice(0, 3).join(' | ') : '';
  const emojis = emoji ? { instagram: '✨', linkedin: '💼', twitter: '🚀' } : {};
  const icon = emojis[platform] || '✨';

  const bios = {
    instagram: `${emoji ? icon + ' ' : ''}${name}\n${profession}${skillsStr ? '\n' + skillsStr : ''}\n📍 Making an impact every day`,
    linkedin: `${name} | ${profession}${skillsStr ? ' | ' + skillsStr : ''} | Passionate about innovation and creating value`,
    twitter: `${emoji ? icon + ' ' : ''}${profession} | ${name}${skillsStr ? ' | ' + skillsStr : ''} | Sharing thoughts on tech & life`,
  };

  const bio = bios[platform] || bios.instagram;
  res.json({ success: true, result: { bio, characterCount: bio.length, platform } });
});

router.post('/caption-formatter', (req, res) => {
  const { text, style = 'default', addEmojis = false } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Text required' });

  const styles = {
    default: t => t,
    spaced: t => t.split('').join(' '),
    bold: t => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D400);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D41A);
      return c;
    }).join(''),
    italic: t => t.split('').map(c => {
      const code = c.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1D434);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1D44E);
      return c;
    }).join(''),
  };

  const format = styles[style] || styles.default;
  const formatted = format(text);
  const withEmojis = addEmojis ? `✨ ${formatted} ✨` : formatted;

  res.json({ success: true, result: { formatted: withEmojis, style } });
});

router.post('/line-break-generator', (req, res) => {
  const { text, platform = 'instagram' } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Text required' });

  const formatted = text.split('\n').map(line => line.trim()).join('\n.\n');
  const instaFormatted = text.split('\n').map(line => line || '.').join('\n');

  const result = platform === 'instagram' ? instaFormatted : formatted;
  res.json({ success: true, result: { formatted: result, platform, lineCount: text.split('\n').length } });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
