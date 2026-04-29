// EXTREME SEO: Semantic Entity Recognition System
export interface SemanticEntity {
  type: 'Person' | 'Organization' | 'Place' | 'Product' | 'Service' | 'Technology' | 'Concept';
  name: string;
  description: string;
  properties: Record<string, any>;
  relationships: Array<{
    target: string;
    type: string;
    strength: number;
  }>;
}

export interface TopicalCluster {
  mainTopic: string;
  relatedEntities: string[];
  supportingKeywords: string[];
  userIntents: Array<{
    intent: 'informational' | 'commercial' | 'transactional' | 'navigational';
    keywords: string[];
    questions: string[];
  }>;
  contentAngles: string[];
  semanticVariations: string[];
}

export const semanticEntities: Record<string, SemanticEntity[]> = {
  'pdf-tools': [
    {
      type: 'Technology',
      name: 'PDF',
      description: 'Portable Document Format, a file format developed by Adobe for presenting documents',
      properties: {
        fileExtension: '.pdf',
        mimeType: 'application/pdf',
        developer: 'Adobe Systems',
        released: '1993',
        standard: 'ISO 32000-1'
      },
      relationships: [
        { target: 'Word', type: 'converts_to', strength: 0.95 },
        { target: 'Excel', type: 'converts_to', strength: 0.85 },
        { target: 'PowerPoint', type: 'converts_to', strength: 0.80 }
      ]
    },
    {
      type: 'Service',
      name: 'Document Conversion',
      description: 'Process of converting documents from one format to another',
      properties: {
        process: 'file transformation',
        output: 'different format',
        preservation: 'formatting, content, structure'
      },
      relationships: [
        { target: 'PDF', type: 'processes', strength: 0.90 }
      ]
    }
  ],
  'image-tools': [
    {
      type: 'Technology',
      name: 'Image Compression',
      description: 'Process of reducing image file size while maintaining quality',
      properties: {
        algorithms: ['JPEG', 'PNG', 'WebP'],
        metrics: ['PSNR', 'SSIM', 'LPIPS'],
        tradeoff: 'size vs quality'
      },
      relationships: [
        { target: 'Website Performance', type: 'improves', strength: 0.95 },
        { target: 'SEO', type: 'improves', strength: 0.85 }
      ]
    }
  ]
};

export const topicalClusters: Record<string, TopicalCluster> = {
  'pdf-conversion': {
    mainTopic: 'PDF Document Conversion',
    relatedEntities: ['PDF', 'Microsoft Word', 'Adobe Acrobat', 'Document Management'],
    supportingKeywords: [
      'document workflow', 'file format conversion', 'digital transformation', 
      'office productivity', 'paperless office', 'document automation',
      'file compatibility', 'cross-platform documents', 'universal document format'
    ],
    userIntents: [
      {
        intent: 'transactional',
        keywords: ['convert pdf to word', 'pdf converter online', 'pdf to docx free'],
        questions: [
          'how to convert pdf to word',
          'best pdf to word converter',
          'convert pdf without losing formatting'
        ]
      },
      {
        intent: 'informational',
        keywords: ['pdf vs word', 'pdf format explained', 'document formats comparison'],
        questions: [
          'what is pdf format',
          'difference between pdf and word',
          'when to use pdf vs word'
        ]
      }
    ],
    contentAngles: [
      'Professional Document Workflow',
      'Academic Research Papers',
      'Legal Document Processing',
      'Business Report Generation',
      'Educational Material Creation'
    ],
    semanticVariations: [
      'portable document format conversion',
      'digital document transformation',
      'file format interoperability',
      'document format standardization'
    ]
  },
  'image-optimization': {
    mainTopic: 'Image Optimization for Web',
    relatedEntities: ['JPEG', 'PNG', 'WebP', 'Website Performance', 'Core Web Vitals'],
    supportingKeywords: [
      'page speed optimization', 'image compression', 'web performance',
      'user experience', 'mobile optimization', 'SEO ranking factors',
      'visual content optimization', 'media optimization', 'bandwidth reduction'
    ],
    userIntents: [
      {
        intent: 'transactional',
        keywords: ['compress image', 'reduce image size', 'image optimizer'],
        questions: [
          'how to compress images for web',
          'best image compression tool',
          'reduce image file size without quality loss'
        ]
      },
      {
        intent: 'commercial',
        keywords: ['website speed optimization', 'SEO image optimization'],
        questions: [
          'how images affect SEO',
          'best image format for web',
          'optimize images for Core Web Vitals'
        ]
      }
    ],
    contentAngles: [
      'E-commerce Product Images',
      'Blog Visual Content',
      'Social Media Graphics',
      'Website Hero Images',
      'Mobile App Screenshots'
    ],
    semanticVariations: [
      'visual asset optimization',
      'digital image compression',
      'web-ready image processing',
      'media file size reduction'
    ]
  }
};

export const generateSemanticKeywords = (cluster: string, baseKeywords: string[]): string[] => {
  const topicalData = topicalClusters[cluster];
  if (!topicalData) return baseKeywords;
  
  const semanticKeywords: string[] = [...baseKeywords];
  
  // Add entity-based keywords
  topicalData.relatedEntities.forEach(entity => {
    semanticKeywords.push(`${entity} ${topicalData.mainTopic.toLowerCase()}`);
    semanticKeywords.push(`${topicalData.mainTopic} ${entity}`);
  });
  
  // Add supporting keywords
  semanticKeywords.push(...topicalData.supportingKeywords);
  
  // Add semantic variations
  semanticKeywords.push(...topicalData.semanticVariations);
  
  // Add intent-based keywords
  topicalData.userIntents.forEach(intent => {
    semanticKeywords.push(...intent.keywords);
    semanticKeywords.push(...intent.questions);
  });
  
  // Add content angle variations
  topicalData.contentAngles.forEach(angle => {
    semanticKeywords.push(`${topicalData.mainTopic} for ${angle}`);
    semanticKeywords.push(`${angle} ${topicalData.mainTopic}`);
  });
  
  return [...new Set(semanticKeywords)]; // Remove duplicates
};

export const generateStructuredData = (toolSlug: string, cluster: string) => {
  const entities = semanticEntities[cluster] || [];
  const clusterData = topicalClusters[cluster];
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'INR'
        },
        featureList: clusterData?.supportingKeywords || [],
        screenshot: `https://www.dailytools247.app/og-${toolSlug}.webp`
      },
      ...entities.map(entity => ({
        '@type': entity.type,
        name: entity.name,
        description: entity.description,
        ...entity.properties
      })),
      {
        '@type': 'FAQPage',
        mainEntity: clusterData?.userIntents.flatMap(intent => 
          intent.questions.map(question => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Our ${toolSlug.replace(/-/g, ' ')} tool provides the best solution for ${question.toLowerCase()}.`
            }
          }))
        )
      },
      {
        '@type': 'HowTo',
        name: `How to use ${toolSlug.replace(/-/g, ' ')}`,
        description: `Step-by-step guide for ${clusterData?.mainTopic}`,
        step: [
          {
            '@type': 'HowToStep',
            name: 'Upload File',
            text: 'Select or drag and drop your file'
          },
          {
            '@type': 'HowToStep',
            name: 'Configure Settings',
            text: 'Adjust parameters according to your needs'
          },
          {
            '@type': 'HowToStep',
            name: 'Process',
            text: 'Click the process button to start conversion'
          },
          {
            '@type': 'HowToStep',
            name: 'Download Result',
            text: 'Download your processed file'
          }
        ]
      }
    ]
  };
  
  return structuredData;
};
