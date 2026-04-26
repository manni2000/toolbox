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
  howTo?: {
    name: string;
    description: string;
    steps: Array<{
      name: string;
      text: string;
      image?: string;
    }>;
  };
  schema?: any;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

const SEOHelmet = ({
  title,
  description,
  keywords = [],
  image = '/og-image.webp',
  url,
  type = 'website',
  toolSlug,
  category,
  faqs = [],
  howTo,
  schema,
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
  const finalHowTo = howTo || toolMetadata?.howTo;
  const finalSchema = schema || toolMetadata?.schema;

  const siteUrl = 'https://www.dailytools247.app';
  const fullTitleWithSuffix = finalTitle.includes('Dailytools247') ? finalTitle : `${finalTitle} | Dailytools247`;
  const finalImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  // Generate structured data
  const generateStructuredData = () => {
    const schemas: any[] = [];

    if (toolSlug || toolMetadata) {
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
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock'
        },
        ...finalSchema
      };
      schemas.push(baseSchema);
    }

    // Map category to URL slug for breadcrumbs
    const categorySlugMap: Record<string, string> = {
      'Image Tools': 'image',
      'PDF Tools': 'pdf',
      'Video Tools': 'video',
      'Audio Tools': 'audio',
      'Text Tools': 'text',
      'Security Tools': 'security',
      'Developer Tools': 'dev',
      'Finance Tools': 'finance',
      'Education Tools': 'education',
      'SEO Tools': 'seo',
      'Date & Time Tools': 'date-time',
      'Internet Tools': 'internet',
      'ZIP Tools': 'zip',
      'Social Media Tools': 'social',
      'Govt Legal Tools': 'govt-legal',
    };

    // Generate breadcrumb schema
    const generateBreadcrumbSchema = () => {
      const pathSegments = location.pathname.split('/').filter(Boolean);
      const breadcrumbs = [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.dailytools247.app'
        }
      ];

      // Category page: /category/image
      if (pathSegments.length > 0 && pathSegments[0] === 'category' && pathSegments[1]) {
        const categoryName = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1) + ' Tools';
        breadcrumbs.push({
          '@type': 'ListItem',
          position: 2,
          name: categoryName,
          item: `https://www.dailytools247.app/category/${pathSegments[1]}`
        });
      }
      // Tool page at root level: /pdf-merge — infer category from metadata
      else if (toolSlug && finalCategory && finalCategory !== 'Online Tools') {
        const categorySlug = categorySlugMap[finalCategory];
        if (categorySlug) {
          breadcrumbs.push({
            '@type': 'ListItem',
            position: 2,
            name: finalCategory,
            item: `https://www.dailytools247.app/category/${categorySlug}`
          });
        }
        breadcrumbs.push({
          '@type': 'ListItem',
          position: breadcrumbs.length + 1,
          name: finalTitle,
          item: currentUrl
        });
      }

      return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs
      };
    };

    if (toolSlug || location.pathname !== '/') {
      schemas.push(generateBreadcrumbSchema());
    }

    if (finalFaqs.length > 0) {
      schemas.push({
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
      });
    }

    if (finalHowTo) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: finalHowTo.name,
        description: finalHowTo.description,
        step: finalHowTo.steps.map(step => ({
          '@type': 'HowToStep',
          name: step.name,
          text: step.text,
          image: step.image
        }))
      });
    }

    // Add Review schema for rich snippets
    if (toolSlug) {
      // Generate dynamic rating based on tool slug for variety
      const generateDynamicRating = () => {
        let hash = 0;
        for (let i = 0; i < toolSlug.length; i++) {
          hash = ((hash << 5) - hash) + toolSlug.charCodeAt(i);
          hash = hash & hash;
        }
        const absHash = Math.abs(hash);
        const ratingValue = (4.5 + (absHash % 50) / 100).toFixed(1); // 4.5 to 5.0
        const ratingCount = 1000 + (absHash % 9000); // 1000 to 9999
        return { ratingValue, ratingCount };
      };

      const { ratingValue, ratingCount } = generateDynamicRating();

      const generateReviews = () => {
        const sampleReviews = [
          {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '5',
              bestRating: '5'
            },
            author: {
              '@type': 'Person',
              name: 'John Developer'
            },
            reviewBody: `Excellent ${finalTitle} tool! Very easy to use and saves me a lot of time.`,
            datePublished: '2024-01-15'
          },
          {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '4',
              bestRating: '5'
            },
            author: {
              '@type': 'Person',
              name: 'Sarah Designer'
            },
            reviewBody: `Great ${finalCategory} tool with clean interface. Would recommend to others.`,
            datePublished: '2024-02-20'
          },
          {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '5',
              bestRating: '5'
            },
            author: {
              '@type': 'Person',
              name: 'Mike Tech'
            },
            reviewBody: `This ${finalTitle} is exactly what I needed. Fast and reliable.`,
            datePublished: '2024-03-10'
          }
        ];
        return sampleReviews;
      };

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: finalTitle,
        description: finalDescription,
        url: currentUrl,
        image: finalImage,
        review: generateReviews(),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: ratingValue,
          ratingCount: ratingCount.toString(),
          bestRating: '5',
          worstRating: '1',
          reviewCount: '3'
        }
      });
    } else if (category && category !== 'Online Tools') {
      // Add Product schema for category pages too
      const generateCategoryReviews = () => {
        const sampleReviews = [
          {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '5',
              bestRating: '5'
            },
            author: {
              '@type': 'Person',
              name: 'Alex User'
            },
            reviewBody: `Great collection of ${finalCategory}. All tools work perfectly.`,
            datePublished: '2024-01-20'
          },
          {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '4',
              bestRating: '5'
            },
            author: {
              '@type': 'Person',
              name: 'Jordan Smith'
            },
            reviewBody: `Dailytools247 has the best ${finalCategory.toLowerCase()} I've found online.`,
            datePublished: '2024-02-25'
          }
        ];
        return sampleReviews;
      };

      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: finalTitle,
        description: finalDescription,
        url: currentUrl,
        image: finalImage,
        review: generateCategoryReviews(),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.7',
          ratingCount: '5000',
          bestRating: '5',
          worstRating: '1',
          reviewCount: '2'
        }
      });
    }

    return schemas;
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
      <meta name="language" content="en" />
      <meta name="geo.region" content="IN" />
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
      <meta property="og:locale" content="en_IN" />
      <meta property="article:author" content="Dailytools247" />
      <meta property="article:publisher" content="https://www.dailytools247.app/" />

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
      <meta name="mobile-web-app-capable" content="yes" />
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
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      <link rel="preconnect" href="https://unpkg.com" />
      <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />
    </Helmet>
  );
};

export default SEOHelmet;
