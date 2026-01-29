const express = require('express');
const router = express.Router();

// Word Counter
router.post('/word-counter', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = text.split(/\n\n+/).filter(paragraph => paragraph.trim().length > 0).length;
    const lines = text.split('\n').length;

    // Word frequency analysis
    const wordFrequency = {};
    words.forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 0) {
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });

    const topWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({ word, count }));

    res.json({
      success: true,
      result: {
        words: words.length,
        characters,
        charactersNoSpaces,
        sentences,
        paragraphs,
        lines,
        readingTime: Math.ceil(words.length / 200), // Average reading speed
        topWords
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Case Converter
router.post('/case-converter', (req, res) => {
  try {
    const { text, caseType } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!caseType) {
      return res.status(400).json({ error: 'Case type is required' });
    }

    let result;
    switch (caseType) {
      case 'uppercase':
        result = text.toUpperCase();
        break;
      case 'lowercase':
        result = text.toLowerCase();
        break;
      case 'titlecase':
        result = text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case 'sentencecase':
        result = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        break;
      case 'alternatingcase':
        result = text.split('').map((char, index) => 
          index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        break;
      case 'camelcase':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
          index === 0 ? word.toLowerCase() : word.toUpperCase()
        ).replace(/\s+/g, '');
        break;
      case 'pascalcase':
        result = text.replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => 
          word.toUpperCase()
        ).replace(/\s+/g, '');
        break;
      case 'snakecase':
        result = text.toLowerCase().replace(/\s+/g, '_');
        break;
      case 'kebabcase':
        result = text.toLowerCase().replace(/\s+/g, '-');
        break;
      default:
        return res.status(400).json({ error: 'Invalid case type' });
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        caseType,
        convertedText: result
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Markdown to HTML Converter
router.post('/markdown-to-html', (req, res) => {
  try {
    const { markdown, action = 'to-html' } = req.body;
    
    if (!markdown) {
      return res.status(400).json({ error: 'Markdown text is required' });
    }

    let result;
    if (action === 'to-html') {
      // Basic markdown to HTML conversion (simplified)
      result = markdown
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/\n/gim, '<br>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        .replace(/^\* (.+)$/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    } else if (action === 'to-plain') {
      // Markdown to plain text
      result = markdown
        .replace(/^#{1,6}\s/gm, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/`(.+?)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^\* (.+)$/gim, '• $1');
    }

    res.json({
      success: true,
      result: {
        originalMarkdown: markdown,
        action,
        output: result
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove Spaces
router.post('/remove-spaces', (req, res) => {
  try {
    const { text, spaceType = 'all' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let result;
    switch (spaceType) {
      case 'all':
        result = text.replace(/\s/g, '');
        break;
      case 'extra':
        result = text.replace(/\s+/g, ' ').trim();
        break;
      case 'leading':
        result = text.replace(/^\s+/g, '');
        break;
      case 'trailing':
        result = text.replace(/\s+$/g, '');
        break;
      case 'linebreaks':
        result = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        break;
      case 'tabs':
        result = text.replace(/\t/g, ' ');
        break;
      default:
        return res.status(400).json({ error: 'Invalid space type' });
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        spaceType,
        processedText: result,
        originalLength: text.length,
        processedLength: result.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Line Sorter
router.post('/line-sorter', (req, res) => {
  try {
    const { text, sortOrder = 'alphabetical', reverse = false } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    let sortedLines;
    switch (sortOrder) {
      case 'alphabetical':
        sortedLines = lines.sort((a, b) => a.localeCompare(b));
        break;
      case 'length':
        sortedLines = lines.sort((a, b) => a.length - b.length);
        break;
      case 'numerical':
        sortedLines = lines.sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numA - numB;
        });
        break;
      case 'reverse':
        sortedLines = lines.reverse();
        break;
      case 'random':
        sortedLines = lines.sort(() => Math.random() - 0.5);
        break;
      default:
        return res.status(400).json({ error: 'Invalid sort order' });
    }

    if (reverse) {
      sortedLines.reverse();
    }

    const result = sortedLines.join('\n');

    res.json({
      success: true,
      result: {
        originalText: text,
        sortOrder,
        reverse,
        sortedText: result,
        originalLines: lines.length,
        sortedLines: sortedLines.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duplicate Remover
router.post('/duplicate-remover', (req, res) => {
  try {
    const { text, removeType = 'lines', caseSensitive = true } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    let result;
    let removedCount = 0;

    if (removeType === 'lines') {
      const lines = text.split('\n');
      const uniqueLines = [];
      const seen = new Set();

      for (const line of lines) {
        const key = caseSensitive ? line : line.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueLines.push(line);
        } else {
          removedCount++;
        }
      }
      result = uniqueLines.join('\n');
    } else if (removeType === 'words') {
      const words = text.split(/\s+/);
      const uniqueWords = [];
      const seen = new Set();

      for (const word of words) {
        const key = caseSensitive ? word : word.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueWords.push(word);
        } else {
          removedCount++;
        }
      }
      result = uniqueWords.join(' ');
    } else if (removeType === 'characters') {
      const chars = text.split('');
      const uniqueChars = [];
      const seen = new Set();

      for (const char of chars) {
        const key = caseSensitive ? char : char.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          uniqueChars.push(char);
        } else {
          removedCount++;
        }
      }
      result = uniqueChars.join('');
    }

    res.json({
      success: true,
      result: {
        originalText: text,
        removeType,
        caseSensitive,
        processedText: result,
        duplicatesRemoved: removedCount,
        originalLength: text.length,
        processedLength: result.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Text Summarizer (Basic implementation)
router.post('/text-summarizer', (req, res) => {
  try {
    const { text, summaryLength = 'medium' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    if (sentences.length === 0) {
      return res.status(400).json({ error: 'No valid sentences found in text' });
    }

    // Basic extractive summarization
    const wordFrequency = {};
    const allWords = text.toLowerCase().split(/\s+/);
    
    allWords.forEach(word => {
      const cleanWord = word.replace(/[^a-z0-9]/g, '');
      if (cleanWord.length > 3) { // Ignore short words
        wordFrequency[cleanWord] = (wordFrequency[cleanWord] || 0) + 1;
      }
    });

    // Score sentences based on word frequency
    const sentenceScores = sentences.map(sentence => {
      const words = sentence.toLowerCase().split(/\s+/);
      let score = 0;
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z0-9]/g, '');
        if (wordFrequency[cleanWord]) {
          score += wordFrequency[cleanWord];
        }
      });
      return { sentence, score };
    });

    // Sort by score and select top sentences
    sentenceScores.sort((a, b) => b.score - a.score);
    
    let summaryLengthNum;
    switch (summaryLength) {
      case 'short':
        summaryLengthNum = Math.max(1, Math.floor(sentences.length * 0.2));
        break;
      case 'medium':
        summaryLengthNum = Math.max(2, Math.floor(sentences.length * 0.4));
        break;
      case 'long':
        summaryLengthNum = Math.max(3, Math.floor(sentences.length * 0.6));
        break;
      default:
        summaryLengthNum = Math.max(2, Math.floor(sentences.length * 0.4));
    }

    const topSentences = sentenceScores
      .slice(0, summaryLengthNum)
      .map(item => item.sentence.trim());

    // Maintain original order
    const summary = sentences
      .filter(sentence => topSentences.includes(sentence.trim()))
      .join('. ') + '.';

    res.json({
      success: true,
      result: {
        originalText: text,
        summary,
        summaryLength,
        originalSentences: sentences.length,
        summarySentences: topSentences.length,
        compressionRatio: ((1 - summary.length / text.length) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Text Diff
router.post('/text-diff', (req, res) => {
  try {
    const { text1, text2, diffType = 'side-by-side' } = req.body;
    
    if (!text1 || !text2) {
      return res.status(400).json({ error: 'Both texts are required' });
    }

    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');

    // Simple diff implementation
    const differences = [];
    const maxLines = Math.max(lines1.length, lines2.length);

    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 !== line2) {
        differences.push({
          lineNumber: i + 1,
          line1,
          line2,
          type: !line1 ? 'added' : !line2 ? 'removed' : 'modified'
        });
      }
    }

    const stats = {
      totalLines1: lines1.length,
      totalLines2: lines2.length,
      added: differences.filter(d => d.type === 'added').length,
      removed: differences.filter(d => d.type === 'removed').length,
      modified: differences.filter(d => d.type === 'modified').length,
      similarity: calculateSimilarity(text1, text2)
    };

    res.json({
      success: true,
      result: {
        text1,
        text2,
        diffType,
        differences,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to calculate text similarity
function calculateSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return (intersection.size / union.size * 100).toFixed(2);
}

module.exports = router;
