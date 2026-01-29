const express = require('express');
const router = express.Router();

// Hashtag Generator
router.post('/hashtag-generator', (req, res) => {
  try {
    const { text, platform = 'instagram', count = 10 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Extract keywords from text
    const keywords = extractKeywords(text);
    
    // Generate hashtags based on platform
    const hashtags = generateHashtags(keywords, platform, count);
    
    // Add trending hashtags (placeholder)
    const trendingHashtags = getTrendingHashtags(platform);
    
    res.json({
      success: true,
      result: {
        originalText: text,
        platform,
        generatedHashtags: hashtags,
        trendingHashtags,
        allHashtags: [...hashtags, ...trendingHashtags.slice(0, 5)],
        recommendations: generateHashtagRecommendations(hashtags.length, platform)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bio Generator
router.post('/bio-generator', (req, res) => {
  try {
    const { name, profession, interests, style = 'professional', length = 'medium' } = req.body;
    
    if (!name || !profession) {
      return res.status(400).json({ error: 'Name and profession are required' });
    }

    const bios = generateBios(name, profession, interests, style, length);
    
    res.json({
      success: true,
      result: {
        name,
        profession,
        interests,
        style,
        length,
        bios
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Caption Formatter
router.post('/caption-formatter', (req, res) => {
  try {
    const { text, format = 'standard', platform = 'instagram' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const formattedCaption = formatCaption(text, format, platform);
    
    res.json({
      success: true,
      result: {
        originalText: text,
        format,
        platform,
        formattedCaption,
        characterCount: formattedCaption.length,
        wordCount: formattedCaption.split(/\s+/).filter(word => word.length > 0).length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Line Break Generator
router.post('/line-break-generator', (req, res) => {
  try {
    const { text, breakType = 'aesthetic', spacing = 'medium' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const textWithBreaks = addLineBreaks(text, breakType, spacing);
    
    res.json({
      success: true,
      result: {
        originalText: text,
        breakType,
        spacing,
        textWithBreaks,
        copyReady: textWithBreaks.replace(/\n/g, '↵')
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Link in Bio Generator
router.post('/link-in-bio', (req, res) => {
  try {
    const { links, style = 'modern', theme = 'dark' } = req.body;
    
    if (!links || !Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ error: 'Links array is required' });
    }

    const linkInBioPage = generateLinkInBioPage(links, style, theme);
    
    res.json({
      success: true,
      result: {
        links,
        style,
        theme,
        html: linkInBioPage.html,
        css: linkInBioPage.css,
        preview: linkInBioPage.preview
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Meme Generator (placeholder)
router.post('/meme-generator', (req, res) => {
  try {
    const { topText, bottomText, template = 'drake', customImage } = req.body;
    
    if (!topText && !bottomText) {
      return res.status(400).json({ error: 'At least one text field is required' });
    }

    // This is a placeholder implementation
    // In a real implementation, you would use an image processing library
    const memeInfo = {
      template,
      topText,
      bottomText,
      customImage: customImage || null,
      memeUrl: 'https://via.placeholder.com/500x500?text=Meme+Generated',
      note: 'This is a placeholder. Implement with real meme generation using canvas or sharp.'
    };

    res.json({
      success: true,
      result: memeInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Social Media Post Generator
router.post('/post-generator', (req, res) => {
  try {
    const { topic, platform = 'instagram', tone = 'casual', includeHashtags = true } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const post = generateSocialMediaPost(topic, platform, tone, includeHashtags);
    
    res.json({
      success: true,
      result: {
        topic,
        platform,
        tone,
        includeHashtags,
        post
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Emoji Suggester
router.post('/emoji-suggester', (req, res) => {
  try {
    const { text, category = 'all', count = 5 } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const suggestedEmojis = suggestEmojis(text, category, count);
    
    res.json({
      success: true,
      result: {
        originalText: text,
        category,
        suggestedEmojis,
        textWithEmojis: addEmojisToText(text, suggestedEmojis.slice(0, 3))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Social Media Analytics (placeholder)
router.post('/analytics', (req, res) => {
  try {
    const { platform, metrics, timeRange = '30d' } = req.body;
    
    if (!platform) {
      return res.status(400).json({ error: 'Platform is required' });
    }

    // This is a placeholder implementation
    const analyticsData = {
      platform,
      timeRange,
      metrics: metrics || ['followers', 'engagement', 'reach'],
      data: {
        followers: {
          current: 10000,
          growth: 15.5,
          trend: 'up'
        },
        engagement: {
          rate: 4.2,
          likes: 420,
          comments: 85,
          shares: 63
        },
        reach: {
          total: 25000,
          impressions: 45000,
          unique: 18000
        }
      },
      note: 'This is a placeholder. Implement with real social media API integration.'
    };

    res.json({
      success: true,
      result: analyticsData
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Content Calendar Generator
router.post('/content-calendar', (req, res) => {
  try {
    const { startDate, endDate, themes, platforms = ['instagram', 'twitter'], postFrequency = 'daily' } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const calendar = generateContentCalendar(startDate, endDate, themes, platforms, postFrequency);
    
    res.json({
      success: true,
      result: {
        startDate,
        endDate,
        themes,
        platforms,
        postFrequency,
        calendar,
        totalPosts: calendar.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper functions
function extractKeywords(text) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must'];
  
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Sort by frequency and return top keywords
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word);
}

function generateHashtags(keywords, platform, count) {
  const platformSpecific = {
    instagram: {
      popular: ['#instagood', '#photooftheday', '#love', '#beautiful', '#happy'],
      format: (word) => `#${word}`
    },
    twitter: {
      popular: ['#trending', '#news', '#tech', '#business', '#marketing'],
      format: (word) => `#${word}`
    },
    linkedin: {
      popular: ['#professional', '#business', '#networking', '#career', '#leadership'],
      format: (word) => `#${word}`
    },
    tiktok: {
      popular: ['#fyp', '#foryou', '#viral', '#trending', '#dance'],
      format: (word) => `#${word}`
    }
  };

  const config = platformSpecific[platform] || platformSpecific.instagram;
  const hashtags = [];
  
  // Add keyword-based hashtags
  keywords.slice(0, count - 2).forEach(keyword => {
    hashtags.push(config.format(keyword.replace(/\s+/g, '')));
  });
  
  // Add some popular hashtags
  hashtags.push(...config.popular.slice(0, 2));
  
  return hashtags.slice(0, count);
}

function getTrendingHashtags(platform) {
  const trending = {
    instagram: ['#reels', '#explore', '#instadaily', '#nature', '#art'],
    twitter: ['#breaking', '#politics', '#sports', '#entertainment', '#tech'],
    linkedin: ['#innovation', '#management', '#strategy', '#digital', '#growth'],
    tiktok: ['#challenge', '#comedy', '#music', '#food', '#fitness']
  };
  
  return trending[platform] || trending.instagram;
}

function generateHashtagRecommendations(count, platform) {
  const recommendations = [];
  
  if (count < 5) {
    recommendations.push('Consider using more hashtags to increase visibility');
  } else if (count > 30) {
    recommendations.push('Too many hashtags may look spammy. Consider reducing them');
  } else {
    recommendations.push('Good number of hashtags for optimal engagement');
  }
  
  if (platform === 'instagram') {
    recommendations.push('Instagram allows up to 30 hashtags per post');
  } else if (platform === 'twitter') {
    recommendations.push('Twitter works best with 1-2 relevant hashtags');
  } else if (platform === 'linkedin') {
    recommendations.push('LinkedIn performs best with 3-5 professional hashtags');
  }
  
  return recommendations;
}

function generateBios(name, profession, interests, style, length) {
  const styles = {
    professional: [
      `${name} | ${profession} | Helping businesses achieve their goals through innovative solutions`,
      `${name} - ${profession} | Passionate about excellence and continuous improvement`,
      `${name} | ${profession} | Strategic thinker with a track record of success`
    ],
    casual: [
      `${name} | ${profession} | Coffee enthusiast ☕ | Problem solver 🚀`,
      `${name} - ${profession} | Living my best life, one project at a time`,
      `${name} | ${profession} | Turning ideas into reality ✨`
    ],
    creative: [
      `${name} | ${profession} | Creating magic where others see chaos 🎨`,
      `${name} - ${profession} | Dreamer, doer, and everything in between`,
      `${name} | ${profession} | Making the world more interesting, one day at a time`
    ]
  };
  
  const bios = styles[style] || styles.professional;
  
  if (interests) {
    return bios.map(bio => `${bio} | ${interests}`);
  }
  
  return bios;
}

function formatCaption(text, format, platform) {
  let formatted = text;
  
  switch (format) {
    case 'standard':
      // Standard formatting with proper capitalization
      formatted = text.charAt(0).toUpperCase() + text.slice(1);
      break;
    case 'allcaps':
      formatted = text.toUpperCase();
      break;
    case 'lowercase':
      formatted = text.toLowerCase();
      break;
    case 'titlecase':
      formatted = text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      break;
    case 'aesthetic':
      // Add aesthetic spacing
      formatted = text.split('').join(' ');
      break;
    case 'emoji':
      // Add emojis at the end
      formatted = text + ' ✨ 🚀 💫';
      break;
  }
  
  // Platform-specific formatting
  if (platform === 'twitter' && formatted.length > 280) {
    formatted = formatted.substring(0, 277) + '...';
  }
  
  return formatted;
}

function addLineBreaks(text, breakType, spacing) {
  const spacingMap = {
    small: '\n',
    medium: '\n\n',
    large: '\n\n\n'
  };
  
  const breakChar = spacingMap[spacing] || '\n\n';
  
  switch (breakType) {
    case 'aesthetic':
      return text.split(' ').join(breakChar);
    case 'sentence':
      return text.split('. ').join('.' + breakChar);
    case 'paragraph':
      return text.split('\n\n').join(breakChar);
    case 'custom':
      return text.split('').join(breakChar);
    default:
      return text + breakChar;
  }
}

function generateLinkInBioPage(links, style, theme) {
  const colors = {
    dark: {
      background: '#000000',
      text: '#ffffff',
      button: '#ffffff',
      buttonHover: '#333333'
    },
    light: {
      background: '#ffffff',
      text: '#000000',
      button: '#000000',
      buttonHover: '#f0f0f0'
    },
    gradient: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      text: '#ffffff',
      button: '#ffffff',
      buttonHover: 'rgba(255,255,255,0.8)'
    }
  };
  
  const colorScheme = colors[theme] || colors.dark;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Link in Bio</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          background: ${colorScheme.background};
          color: ${colorScheme.text};
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          text-align: center;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
        }
        .link {
          display: block;
          background: ${colorScheme.button};
          color: ${colorScheme.background};
          text-decoration: none;
          padding: 15px 20px;
          margin: 10px 0;
          border-radius: 8px;
          transition: background 0.3s;
        }
        .link:hover {
          background: ${colorScheme.buttonHover};
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>My Links</h1>
        ${links.map(link => `<a href="${link.url}" class="link">${link.title}</a>`).join('')}
      </div>
    </body>
    </html>
  `;
  
  return {
    html,
    css: `/* CSS for ${style} style with ${theme} theme */`,
    preview: 'https://via.placeholder.com/400x600?text=Link+in+Bio+Preview'
  };
}

function generateSocialMediaPost(topic, platform, tone, includeHashtags) {
  const tones = {
    casual: ['Hey everyone! Check this out about ' + topic + '!', 'Just discovered something amazing about ' + topic + '. You need to see this!'],
    professional: ['Excited to share insights on ' + topic + '. This is a game-changer for our industry.', 'Latest developments in ' + topic + ' are reshaping how we approach challenges.'],
    enthusiastic: ['🚀 ' + topic.toUpperCase() + ' IS EVERYTHING! You won\'t believe this!', 'MIND-BLOWING facts about ' + topic + '! This changes everything!'],
    educational: ['Did you know? ' + topic + ' plays a crucial role in...', 'Understanding ' + topic + ': A comprehensive guide to...']
  };
  
  const posts = tones[tone] || tones.casual;
  const post = posts[Math.floor(Math.random() * posts.length)];
  
  if (includeHashtags) {
    const hashtags = generateHashtags([topic], platform, 5);
    return post + '\n\n' + hashtags.join(' ');
  }
  
  return post;
}

function suggestEmojis(text, category, count) {
  const emojiCategories = {
    emotions: ['😊', '😎', '🤔', '😍', '🥳', '😂', '🤗', '😇'],
    objects: ['💻', '📱', '🚀', '💡', '🎯', '📊', '🔧', '⚡'],
    nature: ['🌟', '🌈', '🌺', '🌊', '🌅', '🌿', '🍃', '🌸'],
    food: ['☕', '🍕', '🥗', '🍰', '🍎', '🥑', '🍓', '🥐'],
    activities: ['🏃', '💪', '🧘', '📚', '🎨', '🎵', '🎮', '✈️']
  };
  
  const emojis = category === 'all' ? 
    [...emojiCategories.emotions, ...emojiCategories.objects, ...emojiCategories.nature] :
    emojiCategories[category] || emojiCategories.emotions;
  
  return emojis.slice(0, count);
}

function addEmojisToText(text, emojis) {
  const words = text.split(' ');
  const emojiText = words.map((word, index) => {
    if (index % 3 === 0 && emojis.length > 0) {
      return word + ' ' + emojis[Math.floor(Math.random() * emojis.length)];
    }
    return word;
  }).join(' ');
  
  return emojiText;
}

function generateContentCalendar(startDate, endDate, themes, platforms, postFrequency) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const calendar = [];
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    
    // Skip weekends for business platforms
    if (platforms.includes('linkedin') && (dayOfWeek === 0 || dayOfWeek === 6)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    
    const theme = themes && themes.length > 0 ? 
      themes[Math.floor(Math.random() * themes.length)] : 
      'General content';
    
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    
    calendar.push({
      date: currentDate.toISOString().split('T')[0],
      platform,
      theme,
      postType: getRandomPostType(platform),
      status: 'scheduled'
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return calendar;
}

function getRandomPostType(platform) {
  const postTypes = {
    instagram: ['image', 'reel', 'story', 'carousel'],
    twitter: ['text', 'image', 'video', 'poll'],
    linkedin: ['text', 'image', 'article', 'video'],
    facebook: ['text', 'image', 'video', 'link']
  };
  
  const types = postTypes[platform] || ['text', 'image'];
  return types[Math.floor(Math.random() * types.length)];
}

module.exports = router;
