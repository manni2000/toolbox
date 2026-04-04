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
  // Try to get enhanced metadata if slug is provided
  const enhancedMetadata = toolSlug ? getToolSeoMetadata(toolSlug) : null;

  const defaultKeywords = [
    'free online tool',
    'online converter',
    'web tool',
    'dailytools247',
    category.toLowerCase(),
  ];

  // Use enhanced keywords if available, otherwise use provided keywords
  const toolKeywords = enhancedMetadata
    ? [...enhancedMetadata.keywords, ...enhancedMetadata.longTailKeywords]
    : [...defaultKeywords, ...keywords, toolName.toLowerCase()];

  const allKeywords = toolKeywords
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .join(', ');

  // Use enhanced description if available
  const description = enhancedMetadata?.description || toolDescription;
  const title = enhancedMetadata?.title || toolName;

  return (
    <SEOHelmet
      title={title}
      description={description}
      keywords={allKeywords}
    />
  );
};

// Pre-built SEO configs for common tool categories
export const CategorySEO = {
  Image: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Image Tools"
      keywords={['image editor', 'photo tool', 'image converter', 'resize image', 'compress image']}
      toolSlug={toolSlug}
    />
  ),
  PDF: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="PDF Tools"
      keywords={['pdf converter', 'merge pdf', 'split pdf', 'pdf editor', 'pdf to word']}
      toolSlug={toolSlug}
    />
  ),
  Video: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Video Tools"
      keywords={['video converter', 'video editor', 'trim video', 'video to audio', 'compress video']}
      toolSlug={toolSlug}
    />
  ),
  Audio: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Audio Tools"
      keywords={['audio converter', 'audio editor', 'trim audio', 'merge audio', 'audio compressor']}
      toolSlug={toolSlug}
    />
  ),
  Text: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Text Tools"
      keywords={['text editor', 'word counter', 'case converter', 'text formatter', 'text tool']}
      toolSlug={toolSlug}
    />
  ),
  Security: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Security Tools"
      keywords={['password generator', 'encryption', 'hash generator', 'security tool', 'uuid generator']}
      toolSlug={toolSlug}
    />
  ),
  Dev: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Developer Tools"
      keywords={['json formatter', 'code formatter', 'developer tool', 'regex tester', 'jwt decoder']}
      toolSlug={toolSlug}
    />
  ),
  Finance: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Finance Tools"
      keywords={['calculator', 'finance calculator', 'loan calculator', 'emi calculator', 'tax calculator']}
      toolSlug={toolSlug}
    />
  ),
  Education: (toolName: string, description: string, toolSlug?: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Education Tools"
      keywords={['calculator', 'converter', 'education tool', 'study tool', 'academic tool']}
      toolSlug={toolSlug}
    />
  ),
};
