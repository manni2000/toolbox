// EXTREME SEO: Topical Authority System
export interface AuthorityPillar {
  pillarTopic: string;
  pillarUrl: string;
  clusterContent: Array<{
    url: string;
    title: string;
    focusKeyword: string;
    secondaryKeywords: string[];
    contentType: 'tool' | 'guide' | 'comparison' | 'tutorial' | 'faq';
    internalLinks: string[];
    externalAuthority: string[];
  }>;
  supportingEntities: string[];
  semanticRelationships: Array<{
    entity: string;
    relationshipType: string;
    strength: number;
  }>;
  contentDepth: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  searchIntent: 'informational' | 'commercial' | 'transactional' | 'navigational';
}

export const authorityPillars: Record<string, AuthorityPillar> = {
  'pdf-management': {
    pillarTopic: 'PDF Document Management & Conversion',
    pillarUrl: '/pdf-tools-complete-guide',
    clusterContent: [
      {
        url: '/pdf-to-word',
        title: 'PDF to Word Converter - Convert PDF to DOCX Online Free',
        focusKeyword: 'pdf to word converter',
        secondaryKeywords: [
          'convert pdf to word',
          'pdf to docx converter',
          'pdf to editable word',
          'pdf document converter',
          'online pdf converter',
          'free pdf to word',
          'pdf to word conversion',
          'pdf to word tool',
          'pdf to word software',
          'pdf to word online'
        ],
        contentType: 'tool',
        internalLinks: [
          '/pdf-merge',
          '/pdf-split',
          '/pdf-compress',
          '/word-to-pdf',
          '/pdf-tools-complete-guide'
        ],
        externalAuthority: [
          'https://www.adobe.com/acrobat/online/pdf-to-word.html',
          'https://support.microsoft.com/en-us/office/save-or-convert-to-pdf-or-xps-9d4e3a57-6a3a-4ba8-a2a0-6b8c7e6e5e0e'
        ]
      },
      {
        url: '/pdf-merge',
        title: 'PDF Merger - Combine Multiple PDF Files into One',
        focusKeyword: 'pdf merger',
        secondaryKeywords: [
          'combine pdf files',
          'merge multiple pdfs',
          'pdf joiner',
          'concatenate pdf',
          'pdf combiner',
          'merge pdf online',
          'combine pdf documents',
          'pdf merge tool',
          'join pdf files',
          'pdf merger software'
        ],
        contentType: 'tool',
        internalLinks: [
          '/pdf-split',
          '/pdf-to-word',
          '/pdf-compress',
          '/pdf-tools-complete-guide'
        ],
        externalAuthority: []
      },
      {
        url: '/pdf-compression-guide',
        title: 'Complete Guide to PDF Compression - Reduce File Size Without Quality Loss',
        focusKeyword: 'pdf compression guide',
        secondaryKeywords: [
          'compress pdf file size',
          'reduce pdf size',
          'pdf optimization',
          'pdf size reduction',
          'pdf compression techniques',
          'best pdf compressor',
          'pdf compression software',
          'optimize pdf for web',
          'pdf compression settings',
          'pdf compression algorithms'
        ],
        contentType: 'guide',
        internalLinks: [
          '/pdf-compress',
          '/pdf-tools-complete-guide',
          '/pdf-to-word'
        ],
        externalAuthority: []
      },
      {
        url: '/pdf-vs-word-comparison',
        title: 'PDF vs Word - When to Use Each Format (2024 Comparison)',
        focusKeyword: 'pdf vs word',
        secondaryKeywords: [
          'pdf word difference',
          'pdf vs docx',
          'when to use pdf',
          'when to use word',
          'pdf advantages',
          'word advantages',
          'document format comparison',
          'pdf vs word for business',
          'pdf vs word for editing',
          'best document format'
        ],
        contentType: 'comparison',
        internalLinks: [
          '/pdf-to-word',
          '/word-to-pdf',
          '/pdf-tools-complete-guide'
        ],
        externalAuthority: []
      }
    ],
    supportingEntities: [
      'Adobe Acrobat',
      'Microsoft Word',
      'Document Management',
      'Digital Signatures',
      'OCR Technology',
      'File Compression',
      'Cloud Storage',
      'Mobile Devices'
    ],
    semanticRelationships: [
      { entity: 'Document Workflow', relationshipType: 'enables', strength: 0.95 },
      { entity: 'Paperless Office', relationshipType: 'supports', strength: 0.90 },
      { entity: 'Digital Transformation', relationshipType: 'facilitates', strength: 0.85 },
      { entity: 'Business Productivity', relationshipType: 'improves', strength: 0.88 }
    ],
    contentDepth: 'expert',
    searchIntent: 'transactional'
  },
  'image-optimization': {
    pillarTopic: 'Image Optimization & Visual Content Processing',
    pillarUrl: '/image-optimization-complete-guide',
    clusterContent: [
      {
        url: '/image-compressor',
        title: 'FREE Image Compressor - Reduce Image Size Without Watermark Online',
        focusKeyword: 'image compressor',
        secondaryKeywords: [
          'compress image',
          'image compression',
          'reduce image size',
          'image optimizer',
          'compress images online',
          'image size reducer',
          'optimize images for web',
          'image compression tool',
          'compress images without quality loss',
          'batch image compressor'
        ],
        contentType: 'tool',
        internalLinks: [
          '/image-resize',
          '/png-to-jpg-converter',
          '/image-optimization-complete-guide'
        ],
        externalAuthority: []
      },
      {
        url: '/image-seo-best-practices',
        title: 'Image SEO Best Practices - Complete Guide for 2024',
        focusKeyword: 'image seo',
        secondaryKeywords: [
          'optimize images for seo',
          'image alt text',
          'image file naming',
          'image seo optimization',
          'web performance images',
          'core web vitals images',
          'image seo checklist',
          'image seo for wordpress',
          'lazy loading images',
          'image compression for seo'
        ],
        contentType: 'guide',
        internalLinks: [
          '/image-compressor',
          '/image-optimization-complete-guide'
        ],
        externalAuthority: []
      }
    ],
    supportingEntities: [
      'JPEG',
      'PNG',
      'WebP',
      'Core Web Vitals',
      'Page Speed',
      'User Experience',
      'Mobile Optimization',
      'CDN'
    ],
    semanticRelationships: [
      { entity: 'Website Performance', relationshipType: 'improves', strength: 0.95 },
      { entity: 'SEO Ranking', relationshipType: 'boosts', strength: 0.90 },
      { entity: 'User Experience', relationshipType: 'enhances', strength: 0.88 },
      { entity: 'Conversion Rate', relationshipType: 'increases', strength: 0.85 }
    ],
    contentDepth: 'expert',
    searchIntent: 'commercial'
  }
};

export const generateInternalLinkingStrategy = (currentTool: string, category: string) => {
  const pillar = authorityPillars[category];
  if (!pillar) return [];
  
  const currentCluster = pillar.clusterContent.find(item => item.url === currentTool);
  if (!currentCluster) return [];
  
  // Generate contextual internal links
  const contextualLinks: Array<{
    url: string;
    anchorText: string;
    context: string;
    relevanceScore: number;
  }> = [];
  
  pillar.clusterContent.forEach(item => {
    if (item.url !== currentTool) {
      // Calculate relevance based on keyword overlap
      const keywordOverlap = currentCluster.secondaryKeywords.filter(keyword => 
        item.secondaryKeywords.includes(keyword)
      ).length;
      
      const relevanceScore = keywordOverlap / Math.max(currentCluster.secondaryKeywords.length, 1);
      
      contextualLinks.push({
        url: item.url,
        anchorText: item.title,
        context: `Related ${item.contentType} for ${category}`,
        relevanceScore: relevanceScore
      });
    }
  });
  
  // Sort by relevance and return top 5
  return contextualLinks
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
};

export const generateTopicalMap = () => {
  const topicalMap: Record<string, any> = {};
  
  Object.entries(authorityPillars).forEach(([key, pillar]) => {
    topicalMap[key] = {
      pillar: pillar.pillarTopic,
      url: pillar.pillarUrl,
      entities: pillar.supportingEntities,
      relationships: pillar.semanticRelationships,
      contentTypes: pillar.clusterContent.map(item => item.contentType),
      totalKeywords: pillar.clusterContent.reduce((acc, item) => 
        acc + 1 + item.secondaryKeywords.length, 0
      ),
      internalLinkDensity: pillar.clusterContent.reduce((acc, item) => 
        acc + item.internalLinks.length, 0
      ) / pillar.clusterContent.length,
      authorityScore: calculateAuthorityScore(pillar)
    };
  });
  
  return topicalMap;
};

const calculateAuthorityScore = (pillar: AuthorityPillar): number => {
  let score = 0;
  
  // Content depth score
  const depthScores = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
  score += depthScores[pillar.contentDepth] * 25;
  
  // Cluster size score
  score += Math.min(pillar.clusterContent.length * 10, 50);
  
  // Entity diversity score
  score += Math.min(pillar.supportingEntities.length * 5, 25);
  
  // Relationship strength score
  const avgRelationshipStrength = pillar.semanticRelationships.reduce((acc, rel) => 
    acc + rel.strength, 0) / Math.max(pillar.semanticRelationships.length, 1);
  score += avgRelationshipStrength * 25;
  
  return Math.min(score, 100);
};
