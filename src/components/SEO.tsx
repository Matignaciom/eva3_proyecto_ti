import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogType?: string;
  ogUrl?: string;
  ogImage?: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: string;
  twitterUrl?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
}

/**
 * Componente para gestionar los metadatos SEO de cada página
 */
export default function SEO({
  title = 'SIGEPA | Sistema de Gestión de Pagos',
  description = 'SIGEPA - Sistema de Gestión de Pagos para comunidades y condominios. Administre pagos, gastos comunes y más.',
  keywords = 'SIGEPA, sistema de gestión, pagos, condominios, gastos comunes, administración, comunidades',
  ogType = 'website',
  ogUrl = 'https://sigepa.com/',
  ogImage = '/og-image.svg',
  ogTitle,
  ogDescription,
  twitterCard = 'summary_large_image',
  twitterUrl,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl = 'https://sigepa.com/',
}: SEOProps) {
  // Usar useEffect para actualizar los metadatos cuando el componente se monta o actualiza
  useEffect(() => {
    // Actualizar título
    document.title = title;
    
    // Actualizar meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Actualizar meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }
    
    // Actualizar Open Graph
    updateMetaTag('property', 'og:type', ogType);
    updateMetaTag('property', 'og:url', ogUrl);
    updateMetaTag('property', 'og:title', ogTitle || title);
    updateMetaTag('property', 'og:description', ogDescription || description);
    updateMetaTag('property', 'og:image', ogImage);
    
    // Actualizar Twitter Card
    updateMetaTag('property', 'twitter:card', twitterCard);
    updateMetaTag('property', 'twitter:url', twitterUrl || ogUrl);
    updateMetaTag('property', 'twitter:title', twitterTitle || ogTitle || title);
    updateMetaTag('property', 'twitter:description', twitterDescription || ogDescription || description);
    updateMetaTag('property', 'twitter:image', twitterImage || ogImage);
    
    // Actualizar URL canónica
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    }
  }, [
    title, description, keywords, 
    ogType, ogUrl, ogTitle, ogDescription, ogImage, 
    twitterCard, twitterUrl, twitterTitle, twitterDescription, twitterImage,
    canonicalUrl
  ]);
  
  // Función auxiliar para actualizar etiquetas meta
  const updateMetaTag = (attribute: string, name: string, content?: string) => {
    if (!content) return;
    
    let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
    if (metaTag) {
      metaTag.setAttribute('content', content);
    }
  };
  
  // Este componente no renderiza nada visible
  return null;
} 