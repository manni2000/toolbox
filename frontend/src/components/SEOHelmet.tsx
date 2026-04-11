import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { getToolSeoMetadata } from '@/data/toolSeoEnhancements';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  toolSlug?: string;
  category?: string;
  faqs?: Array<{ question: string; answer: string }>;
  schema?: any;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

const SEOHelmet = ({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  toolSlug,
  category,
  faqs = [],
  schema,
  ogImage = '/dailytools247.png',
  ogType = 'website',
  canonical,
  noindex = false
}: SEOHelmetProps) => {
  const location = useLocation();
  const currentUrl = url || canonical || `https://www.dailytools247.app${location.pathname}`;
  
  // Get tool-specific metadata if toolSlug is provided
  const toolMetadata = toolSlug ? getToolSeoMetadata(toolSlug) : null;
  
  // Use provided props or fallback to tool metadata
  const finalTitle = title || toolMetadata?.title || 'Dailytools247 - 100+ Free Online Tools';
  const finalDescription = description || toolMetadata?.description || '100+ free online tools for PDF conversion, image editing, video processing, text formatting, QR codes, password generation, JSON formatting and more. No signup required.';
  const finalKeywords = keywords.length > 0 ? keywords : (toolMetadata?.keywords || []);
  const finalCategory = category || toolMetadata?.category || 'Online Tools';
  const finalFaqs = faqs.length > 0 ? faqs : toolMetadata?.faqs || [];
  const finalSchema = schema || toolMetadata?.schema;

  const siteUrl = 'https://www.dailytools247.app';
  const fullTitleWithSuffix = finalTitle.includes('Dailytools247') ? finalTitle : `${finalTitle} | Dailytools247`;
  const finalImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Generate structured data
  const generateStructuredData = () => {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': toolMetadata?.schema?.type || 'WebApplication',
      name: finalTitle,
      description: finalDescription,
      url: currentUrl,
      image: finalImage,
      applicationCategory: toolMetadata?.schema?.appCategory || 'UtilitiesApplication',
      operatingSystem: 'Web',
      browserRequirements: 'Any modern web browser',
      softwareVersion: '1.0.0',
      author: {
        '@type': 'Organization',
        name: 'Dailytools247',
        url: 'https://www.dailytools247.app'
      },
      publisher: {
        '@type': 'Organization',
        name: 'Dailytools247',
        url: 'https://www.dailytools247.app'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '10000',
        bestRating: '5',
        worstRating: '1'
      },
      ...finalSchema
    };

    // Add FAQ schema if FAQs exist
    if (finalFaqs.length > 0) {
      return [
        baseSchema,
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: finalFaqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer
            }
          }))
        }
      ];
    }

    return [baseSchema];
  };

  const structuredData = generateStructuredData();

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitleWithSuffix}</title>
      <meta name="title" content={fullTitleWithSuffix} />
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={Array.isArray(finalKeywords) ? finalKeywords.join(', ') : ''} />
      <meta name="author" content="Dailytools247" />
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex,nofollow" : "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"} />
      <meta name="bingbot" content={noindex ? "noindex,nofollow" : "index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1"} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="category" content={finalCategory} />

      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType || type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitleWithSuffix} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitleWithSuffix} />
      <meta property="og:site_name" content="Dailytools247" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitleWithSuffix} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={fullTitleWithSuffix} />
      <meta name="twitter:creator" content="@dailytools247" />
      <meta name="twitter:site" content="@dailytools247" />

      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="msapplication-TileColor" content="#6366f1" />
      <meta name="msapplication-TileImage" content="/dailytools247.png" />
      <meta name="application-name" content="Dailytools247" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Dailytools247" />

      {/* Structured Data */}
      {structuredData.map((schemaItem, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schemaItem, null, 2)}
        </script>
      ))}

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      <link rel="preconnect" href="https://unpkg.com" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
    </Helmet>
  );
};

export default SEOHelmet;
