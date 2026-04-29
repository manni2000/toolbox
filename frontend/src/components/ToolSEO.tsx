import SEOHelmet from '@/components/SEOHelmet';
import { getToolSeoMetadata } from '@/data/toolSeoEnhancements';

interface ToolSEOProps {
  toolName: string;
  toolDescription: string;
  category: string;
  keywords?: string[];
  toolSlug?: string;
}

export const ToolSEO = ({ toolName, toolDescription, category, keywords = [], toolSlug }: ToolSEOProps) => {
  const enhancedMetadata = toolSlug ? getToolSeoMetadata(toolSlug) : null;

  const description = enhancedMetadata?.description || toolDescription;
  const title = enhancedMetadata?.title || toolName;

  const getOptimizedKeywords = () => {
    const keywordSet = new Set<string>();

    if (enhancedMetadata?.keywords) {
      enhancedMetadata.keywords.slice(0, 3).forEach(k => keywordSet.add(k.toLowerCase()));
    }

    if (enhancedMetadata?.longTailKeywords) {
      enhancedMetadata.longTailKeywords.slice(0, 2).forEach(k => keywordSet.add(k.toLowerCase()));
    }

    keywordSet.add(toolName.toLowerCase());

    keywordSet.add(category.toLowerCase());

    keywords.slice(0, 5).forEach(k => keywordSet.add(k.toLowerCase()));

    
    if (toolSlug) {
      const slugParts = toolSlug.split('-').filter(Boolean);
      slugParts.slice(0, 2).forEach(part => keywordSet.add(part.toLowerCase()));
    }

    return Array.from(keywordSet).slice(0, 10);
  };

  const optimizedKeywords = getOptimizedKeywords();

  return (
    <SEOHelmet
      title={title}
      description={description}
      keywords={optimizedKeywords}
      toolSlug={toolSlug}
      category={category}
      faqs={enhancedMetadata?.faqs}
      howTo={enhancedMetadata?.howTo}
    />
  );
};

export const CategorySEO = {
  Image: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Image Tools"
      keywords={[
        'image editor',
        'image converter',
        'compress image',
        'resize image',
        'crop image',
        'png to jpg',
        'jpg to png'
      ]}
      toolSlug={toolSlug}
    />
  ),
  PDF: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="PDF Tools"
      keywords={[
        'pdf converter',
        'merge pdf',
        'split pdf',
        'pdf to word',
        'word to pdf',
        'compress pdf'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Video: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Video Tools"
      keywords={[
        'video converter',
        'trim video',
        'video to audio',
        'compress video',
        'video resizer',
        'extract audio'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Audio: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Audio Tools"
      keywords={[
        'audio converter',
        'trim audio',
        'merge audio',
        'audio to mp3',
        'audio compressor',
        'audio editor'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Text: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Text Tools"
      keywords={[
        'text editor',
        'word counter',
        'case converter',
        'text formatter',
        'remove duplicates',
        'text sorter'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Security: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Security Tools"
      keywords={[
        'password generator',
        'hash generator',
        'uuid generator',
        'password strength checker',
        'base64 encoder',
        'url encoder'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Dev: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Developer Tools"
      keywords={[
        'json formatter',
        'code formatter',
        'regex tester',
        'jwt decoder',
        'color converter',
        'base64 converter'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Finance: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Finance Tools"
      keywords={[
        'emi calculator',
        'loan calculator',
        'tax calculator',
        'currency converter',
        'budget planner',
        'gst calculator'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Education: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Education Tools"
      keywords={[
        'gpa calculator',
        'percentage calculator',
        'scientific calculator',
        'study timetable',
        'unit converter',
        'cgpa calculator'
      ]}
      toolSlug={toolSlug}
    />
  ),
  SEO: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="SEO Tools"
      keywords={[
        'meta tag generator',
        'keyword analyzer',
        'robots.txt generator',
        'sitemap validator',
        'page speed checker',
        'utm link builder'
      ]}
      toolSlug={toolSlug}
    />
  ),
  DateTime: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Date & Time Tools"
      keywords={[
        'age calculator',
        'date difference',
        'working days calculator',
        'countdown timer',
        'world clock',
        'time zone converter'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Internet: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Internet Tools"
      keywords={[
        'ip lookup',
        'dns lookup',
        'ssl checker',
        'ping test',
        'website screenshot',
        'user agent parser'
      ]}
      toolSlug={toolSlug}
    />
  ),
  ZIP: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="ZIP Tools"
      keywords={[
        'zip creator',
        'zip extractor',
        'file compression',
        'zip password',
        'compress files',
        'extract files'
      ]}
      toolSlug={toolSlug}
    />
  ),
  Social: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Social Media Tools"
      keywords={[
        'hashtag generator',
        'bio generator',
        'caption formatter',
        'link in bio',
        'meme generator',
        'whatsapp status'
      ]}
      toolSlug={toolSlug}
    />
  ),
  GovtLegal: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Govt Legal Tools"
      keywords={[
        'passport photo resizer',
        'aadhaar photo resize',
        'pdf compressor',
        'signature maker',
        'document template',
        'legal document generator',
        'rental agreement',
        'nda template',
        'loan agreement',
      ]}
      toolSlug={toolSlug}
    />
  ),
  Ecommerce: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="E-commerce Tools"
      keywords={[
        'product image editor',
        'background remover',
        'qr code generator',
        'barcode generator',
        'bulk image resizer',
        'watermark adder',
        'gst invoice generator',
        'ecommerce calculator',
        'product photography',
        'amazon image tools',
      ]}
      toolSlug={toolSlug}
    />
  ),
};
