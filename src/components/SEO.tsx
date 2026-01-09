import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  keywords?: string;
  type?: 'website' | 'article';
}

const BASE_URL = 'https://todo.commandboard.online';

export const SEO: React.FC<SEOProps> = ({
  title = 'MD Tasks - Markdown Todo List & File Preview',
  description = 'Transform your markdown files into interactive task lists. Preview MD files, manage tasks, and boost productivity with our free online markdown task manager.',
  canonical = '',
  ogImage = '/og-image.svg',
  keywords = 'md tasks, md files preview, markdown todo list, markdown task manager',
  type = 'website',
}) => {
  const fullTitle = title.includes('CommandBoard') ? title : `${title} | CommandBoard`;
  const fullUrl = `${BASE_URL}${canonical}`;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
    </Helmet>
  );
};
