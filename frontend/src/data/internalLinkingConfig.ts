/**
 * Internal Linking Configuration
 * Implements hub-and-spoke model with topical clusters
 * Based on SEO analysis for building topical authority
 */

export interface HubConfig {
  categoryId: string;
  categoryName: string;
  hubToolSlug: string;
  hubToolPath: string;
  workflowSteps?: Array<{
    step: string;
    toolSlug: string;
    toolName: string;
    description: string;
  }>;
  subClusters?: Array<{
    name: string;
    tools: string[];
  }>;
}

export const categoryHubs: HubConfig[] = [
  {
    categoryId: 'pdf',
    categoryName: 'PDF Tools',
    hubToolSlug: 'pdf-merge',
    hubToolPath: '/pdf-merge',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'pdf-compressor',
        toolName: 'PDF Compressor',
        description: 'Compress PDF files to reduce size'
      },
      {
        step: '2',
        toolSlug: 'pdf-merge',
        toolName: 'PDF Merge',
        description: 'Combine multiple PDFs into one'
      },
      {
        step: '3',
        toolSlug: 'pdf-to-word',
        toolName: 'PDF to Word',
        description: 'Convert PDF to editable Word document'
      },
      {
        step: '4',
        toolSlug: 'pdf-password',
        toolName: 'PDF Password',
        description: 'Add password protection to PDF'
      },
      {
        step: '5',
        toolSlug: 'pdf-add-signature',
        toolName: 'Add Signature',
        description: 'Add digital signature to PDF'
      }
    ],
    subClusters: [
      {
        name: 'PDF Conversion',
        tools: ['pdf-to-word', 'pdf-to-image', 'pdf-to-powerpoint', 'pdf-to-excel', 'word-to-pdf', 'powerpoint-to-pdf', 'html-to-pdf']
      },
      {
        name: 'PDF Organization',
        tools: ['pdf-merge', 'pdf-split', 'pdf-rotate', 'pdf-page-remover', 'pdf-reorder']
      },
      {
        name: 'PDF Security',
        tools: ['pdf-password', 'pdf-unlock']
      }
    ]
  },
  {
    categoryId: 'image',
    categoryName: 'Image Tools',
    hubToolSlug: 'image-compressor',
    hubToolPath: '/image-compressor',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'image-compressor',
        toolName: 'Image Compressor',
        description: 'Compress images for web'
      },
      {
        step: '2',
        toolSlug: 'image-resize',
        toolName: 'Image Resize',
        description: 'Resize to required dimensions'
      },
      {
        step: '3',
        toolSlug: 'png-to-jpg-converter',
        toolName: 'PNG to JPG',
        description: 'Convert format for compatibility'
      },
      {
        step: '4',
        toolSlug: 'background-remover',
        toolName: 'Background Remover',
        description: 'Remove background for products'
      }
    ]
  },
  {
    categoryId: 'finance',
    categoryName: 'Finance Tools',
    hubToolSlug: 'emi-calculator',
    hubToolPath: '/emi-calculator',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'emi-calculator',
        toolName: 'EMI Calculator',
        description: 'Calculate loan EMI payments'
      },
      {
        step: '2',
        toolSlug: 'emi-comparison',
        toolName: 'EMI Comparison',
        description: 'Compare multiple loan options'
      },
      {
        step: '3',
        toolSlug: 'budget-planner',
        toolName: 'Budget Planner',
        description: 'Plan monthly budget'
      }
    ],
    subClusters: [
      {
        name: 'Loan Planning',
        tools: ['emi-calculator', 'emi-comparison', 'budget-planner']
      },
      {
        name: 'Investment',
        tools: ['sip-calculator', 'lumpsum-calculator', 'mutual-fund-calculator', 'roi-calculator', 'stock-cagr-calculator']
      },
      {
        name: 'Business',
        tools: ['gst-calculator', 'invoice-generator', 'profit-margin-calculator', 'ecommerce-calculator']
      }
    ]
  },
  {
    categoryId: 'dev',
    categoryName: 'Developer Tools',
    hubToolSlug: 'json-formatter',
    hubToolPath: '/json-formatter',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'jwt-decoder',
        toolName: 'JWT Decoder',
        description: 'Decode JWT tokens'
      },
      {
        step: '2',
        toolSlug: 'json-formatter',
        toolName: 'JSON Formatter',
        description: 'Format and validate JSON'
      },
      {
        step: '3',
        toolSlug: 'http-header-checker',
        toolName: 'HTTP Header Checker',
        description: 'Check HTTP response headers'
      },
      {
        step: '4',
        toolSlug: 'api-response-formatter',
        toolName: 'API Response Formatter',
        description: 'Format API responses'
      }
    ],
    subClusters: [
      {
        name: 'API Debugging',
        tools: ['jwt-decoder', 'json-formatter', 'http-header-checker', 'api-response-formatter']
      },
      {
        name: 'Code Generation',
        tools: ['cron-generator', 'dockerfile-generator', 'environment-variable-generator', 'postman-collection-generator']
      }
    ]
  },
  {
    categoryId: 'security',
    categoryName: 'Security Tools',
    hubToolSlug: 'password-generator',
    hubToolPath: '/password-generator',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'password-generator',
        toolName: 'Password Generator',
        description: 'Generate secure password'
      },
      {
        step: '2',
        toolSlug: 'password-strength',
        toolName: 'Password Strength',
        description: 'Check password strength'
      },
      {
        step: '3',
        toolSlug: 'hash-generator',
        toolName: 'Hash Generator',
        description: 'Create secure hash'
      }
    ]
  },
  {
    categoryId: 'text',
    categoryName: 'Text Tools',
    hubToolSlug: 'word-counter',
    hubToolPath: '/word-counter',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'word-counter',
        toolName: 'Word Counter',
        description: 'Count words and characters'
      },
      {
        step: '2',
        toolSlug: 'text-summarizer',
        toolName: 'Text Summarizer',
        description: 'Summarize long text'
      },
      {
        step: '3',
        toolSlug: 'case-converter',
        toolName: 'Case Converter',
        description: 'Convert text case'
      }
    ]
  },
  {
    categoryId: 'ecommerce',
    categoryName: 'E-commerce Tools',
    hubToolSlug: 'ecommerce-calculator',
    hubToolPath: '/ecommerce-calculator',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'background-remover',
        toolName: 'Background Remover',
        description: 'Remove image background'
      },
      {
        step: '2',
        toolSlug: 'bulk-image-resizer',
        toolName: 'Bulk Image Resizer',
        description: 'Resize multiple images'
      },
      {
        step: '3',
        toolSlug: 'barcode-generator',
        toolName: 'Barcode Generator',
        description: 'Generate product barcode'
      },
      {
        step: '4',
        toolSlug: 'gst-invoice-generator',
        toolName: 'GST Invoice',
        description: 'Create GST invoice'
      }
    ]
  },
  {
    categoryId: 'video',
    categoryName: 'Video Tools',
    hubToolSlug: 'video-compressor',
    hubToolPath: '/video-compressor',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'video-compressor',
        toolName: 'Video Compressor',
        description: 'Compress video files'
      },
      {
        step: '2',
        toolSlug: 'video-trim',
        toolName: 'Video Trim',
        description: 'Trim video clips'
      },
      {
        step: '3',
        toolSlug: 'video-to-audio',
        toolName: 'Video to Audio',
        description: 'Extract audio from video'
      }
    ]
  },
  {
    categoryId: 'seo',
    categoryName: 'SEO Tools',
    hubToolSlug: 'meta-title-description-generator',
    hubToolPath: '/meta-title-description-generator',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'meta-title-description-generator',
        toolName: 'Meta Title Generator',
        description: 'Generate SEO meta tags'
      },
      {
        step: '2',
        toolSlug: 'keyword-density-checker',
        toolName: 'Keyword Density',
        description: 'Check keyword density'
      },
      {
        step: '3',
        toolSlug: 'robots-txt-generator',
        toolName: 'Robots.txt Generator',
        description: 'Generate robots.txt'
      }
    ]
  },
  {
    categoryId: 'date-time',
    categoryName: 'Date & Time Tools',
    hubToolSlug: 'age-calculator',
    hubToolPath: '/age-calculator',
    workflowSteps: [
      {
        step: '1',
        toolSlug: 'age-calculator',
        toolName: 'Age Calculator',
        description: 'Calculate exact age'
      },
      {
        step: '2',
        toolSlug: 'date-difference',
        toolName: 'Date Difference',
        description: 'Calculate days between dates'
      },
      {
        step: '3',
        toolSlug: 'working-days-calculator',
        toolName: 'Working Days',
        description: 'Calculate business days'
      }
    ]
  }
];

// Cross-cluster linking configuration
export const crossClusterLinks: Record<string, string[]> = {
  'pdf-to-word': ['word-counter', 'text-summarizer'], // PDF → Text
  'image-compressor': ['pdf-add-signature'], // Image → PDF
  'invoice-generator': ['pdf-merge'], // Finance → PDF
  'qr-code-generator': ['barcode-generator'], // E-commerce → E-commerce
  'word-counter': ['pdf-to-word'], // Text → PDF
  'text-summarizer': ['pdf-to-word'], // Text → PDF
  'password-generator': ['hash-generator'], // Security → Security
  'json-formatter': ['jwt-decoder'], // Dev → Dev
  'emi-calculator': ['budget-planner'], // Finance → Finance
  'sip-calculator': ['lumpsum-calculator'], // Finance → Finance
};

// Get hub configuration for a category
export const getHubForCategory = (categoryId: string): HubConfig | undefined => {
  return categoryHubs.find(hub => hub.categoryId === categoryId);
};

// Get workflow steps for a category
export const getWorkflowForCategory = (categoryId: string): HubConfig['workflowSteps'] => {
  const hub = getHubForCategory(categoryId);
  return hub?.workflowSteps;
};

// Get sub-clusters for a category
export const getSubClustersForCategory = (categoryId: string): HubConfig['subClusters'] => {
  const hub = getHubForCategory(categoryId);
  return hub?.subClusters;
};

// Get cross-cluster links for a tool
export const getCrossClusterLinks = (toolSlug: string): string[] => {
  return crossClusterLinks[toolSlug] || [];
};
