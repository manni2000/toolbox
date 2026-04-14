const express = require('express');
const { strictLimiter } = require('../middleware/security');

const router = express.Router();
router.use(strictLimiter);

router.post('/word-counter', (req, res) => {
  const { text = '' } = req.body;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length;
  const readingTime = Math.ceil(words / 200);

  res.json({ success: true, result: { words, characters: chars, charactersNoSpaces: charsNoSpaces, sentences, paragraphs, readingTime: `${readingTime} min read` } });
});

router.post('/case-converter', (req, res) => {
  const { text, caseType = 'upper' } = req.body;
  if (text === undefined) return res.status(400).json({ success: false, error: 'Text required' });

  const converters = {
    upper: t => t.toUpperCase(),
    lower: t => t.toLowerCase(),
    title: t => t.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
    sentence: t => t.replace(/(^\s*\w|[.!?]\s*\w)/g, c => c.toUpperCase()),
    camel: t => t.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    pascal: t => t.replace(/\w+/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).replace(/\s+/g, ''),
    snake: t => t.replace(/\s+/g, '_').replace(/[A-Z]/g, c => '_' + c.toLowerCase()).replace(/^_/, '').toLowerCase(),
    kebab: t => t.replace(/\s+/g, '-').replace(/[A-Z]/g, c => '-' + c.toLowerCase()).replace(/^-/, '').toLowerCase(),
    alternating: t => t.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join(''),
    inverse: t => t.split('').map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join(''),
  };

  const convert = converters[caseType];
  if (!convert) return res.status(400).json({ success: false, error: 'Invalid case type' });

  res.json({ success: true, result: { output: convert(text), caseType } });
});

router.post('/markdown-to-html', (req, res) => {
  const { markdown = '' } = req.body;

  let html = markdown
    .replace(/^#{6}\s(.+)/gm, '<h6>$1</h6>')
    .replace(/^#{5}\s(.+)/gm, '<h5>$1</h5>')
    .replace(/^#{4}\s(.+)/gm, '<h4>$1</h4>')
    .replace(/^#{3}\s(.+)/gm, '<h3>$1</h3>')
    .replace(/^#{2}\s(.+)/gm, '<h2>$1</h2>')
    .replace(/^#{1}\s(.+)/gm, '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2">')
    .replace(/^> (.+)/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.+)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.+)/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.+)$/gm, (m) => m.startsWith('<') ? m : `<p>${m}</p>`);

  res.json({ success: true, result: { html: `<div class="markdown-body">${html}</div>`, markdown } });
});

router.post('/remove-spaces', (req, res) => {
  const { text, type = 'extra' } = req.body;
  if (text === undefined) return res.status(400).json({ success: false, error: 'Text required' });

  const processors = {
    extra: t => t.replace(/[ \t]+/g, ' ').replace(/^ /gm, '').replace(/ $/gm, ''),
    all: t => t.replace(/\s+/g, ''),
    leading: t => t.replace(/^[ \t]+/gm, ''),
    trailing: t => t.replace(/[ \t]+$/gm, ''),
    blank: t => t.replace(/^\s*[\r\n]/gm, ''),
    tabs: t => t.replace(/\t/g, '    '),
  };

  const fn = processors[type] || processors.extra;
  res.json({ success: true, result: { output: fn(text) } });
});

router.post('/line-sorter', (req, res) => {
  const { text, order = 'asc', caseSensitive = false, removeDuplicates = false } = req.body;
  if (text === undefined) return res.status(400).json({ success: false, error: 'Text required' });

  let lines = text.split('\n');
  if (removeDuplicates) {
    const seen = new Set();
    lines = lines.filter(l => {
      const key = caseSensitive ? l : l.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  lines.sort((a, b) => {
    const ca = caseSensitive ? a : a.toLowerCase();
    const cb = caseSensitive ? b : b.toLowerCase();
    return order === 'desc' ? cb.localeCompare(ca) : ca.localeCompare(cb);
  });

  if (order === 'random') {
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [lines[i], lines[j]] = [lines[j], lines[i]];
    }
  }

  res.json({ success: true, result: { output: lines.join('\n'), lineCount: lines.length } });
});

router.post('/duplicate-remover', (req, res) => {
  const { text, caseSensitive = false } = req.body;
  if (text === undefined) return res.status(400).json({ success: false, error: 'Text required' });

  const lines = text.split('\n');
  const seen = new Set();
  const unique = lines.filter(l => {
    const key = caseSensitive ? l : l.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const duplicates = lines.length - unique.length;
  res.json({ success: true, result: { output: unique.join('\n'), original: lines.length, unique: unique.length, duplicatesRemoved: duplicates } });
});

router.post('/text-diff', (req, res) => {
  const { text1 = '', text2 = '' } = req.body;

  const lines1 = text1.split('\n');
  const lines2 = text2.split('\n');
  const diff = [];

  const maxLen = Math.max(lines1.length, lines2.length);
  let added = 0, removed = 0, unchanged = 0;

  for (let i = 0; i < maxLen; i++) {
    const l1 = lines1[i];
    const l2 = lines2[i];

    if (l1 === undefined) { diff.push({ type: 'added', line: l2, lineNum: i + 1 }); added++; }
    else if (l2 === undefined) { diff.push({ type: 'removed', line: l1, lineNum: i + 1 }); removed++; }
    else if (l1 === l2) { diff.push({ type: 'unchanged', line: l1, lineNum: i + 1 }); unchanged++; }
    else { diff.push({ type: 'removed', line: l1, lineNum: i + 1 }, { type: 'added', line: l2, lineNum: i + 1 }); removed++; added++; }
  }

  res.json({ success: true, result: { diff, stats: { added, removed, unchanged, total: maxLen } } });
});

router.post('/text-summarizer', (req, res) => {
  const { text, sentences: sentenceCount = 3 } = req.body;
  if (!text) return res.status(400).json({ success: false, error: 'Text required' });

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const wordFreq = {};
  const words = text.toLowerCase().replace(/[^a-z\s]/g, ' ').split(/\s+/);
  for (const w of words) if (w.length > 3) wordFreq[w] = (wordFreq[w] || 0) + 1;

  const scoredSentences = sentences.map((s, i) => {
    const words = s.toLowerCase().split(/\s+/);
    const score = words.reduce((acc, w) => acc + (wordFreq[w] || 0), 0) / (words.length || 1);
    return { sentence: s.trim(), score, index: i };
  });

  const topSentences = scoredSentences.sort((a, b) => b.score - a.score).slice(0, Math.min(parseInt(sentenceCount) || 3, sentences.length));
  const summary = topSentences.sort((a, b) => a.index - b.index).map(s => s.sentence).join(' ');

  res.json({ success: true, result: { summary, originalSentences: sentences.length, summarySentences: topSentences.length, compressionRatio: `${Math.round((1 - summary.length / text.length) * 100)}%` } });
});

// Add OPTIONS handler for all endpoints in this router
router.options('*', (req, res) => {
  res.sendStatus(204);
});
module.exports = router;
