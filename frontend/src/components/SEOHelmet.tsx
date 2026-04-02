import { Helmet } from 'react-helmet-async';

interface SEOHelmetProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

const SEOHelmet = ({
  title = 'Dailytools247 - Free Online Tools for Everyday Tasks',
  description = 'Access 100+ free online tools for image editing, PDF conversion, text processing, calculators, and more. No signup required. Fast, secure, and privacy-focused.',
  keywords = 'online tools, free tools, PDF converter, image tools, calculators, text tools, QR generator, video converter, audio tools',
  ogImage = '/dailytools247.png',
  ogType = 'website',
  canonical,
  noindex = false
}: SEOHelmetProps) => {
  const siteUrl = 'https://dailytools247.com';
  const fullTitle = title.includes('Dailytools247') ? title : `${title} | Dailytools247`;
  const canonicalUrl = canonical || window.location.href;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:site_name" content="Dailytools247" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />

      {/* Additional Meta */}
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="application-name" content="Dailytools247" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Dailytools247" />
    </Helmet>
  );
};

export default SEOHelmet;
