import SEOHelmet from '@/components/SEOHelmet';

interface ToolSEOProps {
  toolName: string;
  toolDescription: string;
  category: string;
  keywords?: string[];
}

export const ToolSEO = ({ toolName, toolDescription, category, keywords = [] }: ToolSEOProps) => {
  const defaultKeywords = [
    'free online tool',
    'online converter',
    'web tool',
    'dailytools247',
    category.toLowerCase(),
  ];

  const allKeywords = [...defaultKeywords, ...keywords, toolName.toLowerCase()]
    .filter((v, i, a) => a.indexOf(v) === i) // Remove duplicates
    .join(', ');

  return (
    <SEOHelmet
      title={toolName}
      description={toolDescription}
      keywords={allKeywords}
    />
  );
};

// Pre-built SEO configs for common tool categories
export const CategorySEO = {
  Image: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Image Tools"
      keywords={['image editor', 'photo tool', 'image converter', 'resize image', 'compress image']}
    />
  ),
  PDF: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="PDF Tools"
      keywords={['pdf converter', 'merge pdf', 'split pdf', 'pdf editor', 'pdf to word']}
    />
  ),
  Video: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Video Tools"
      keywords={['video converter', 'video editor', 'trim video', 'video to audio', 'compress video']}
    />
  ),
  Audio: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Audio Tools"
      keywords={['audio converter', 'audio editor', 'trim audio', 'merge audio', 'audio compressor']}
    />
  ),
  Text: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Text Tools"
      keywords={['text editor', 'word counter', 'case converter', 'text formatter', 'text tool']}
    />
  ),
  Security: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Security Tools"
      keywords={['password generator', 'encryption', 'hash generator', 'security tool', 'uuid generator']}
    />
  ),
  Dev: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Developer Tools"
      keywords={['json formatter', 'code formatter', 'developer tool', 'regex tester', 'jwt decoder']}
    />
  ),
  Finance: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Finance Tools"
      keywords={['calculator', 'finance calculator', 'loan calculator', 'emi calculator', 'tax calculator']}
    />
  ),
  Education: (toolName: string, description: string) => (
    <ToolSEO
      toolName={toolName}
      toolDescription={description}
      category="Education Tools"
      keywords={['calculator', 'converter', 'education tool', 'study tool', 'academic tool']}
    />
  ),
};
