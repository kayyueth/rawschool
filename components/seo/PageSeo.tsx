import Head from "next/head";
import React from "react";

interface PageSeoProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  children?: React.ReactNode;
}

export default function PageSeo({
  title,
  description,
  canonicalUrl,
  ogImage = "/Logo.svg",
  ogType = "website",
  children,
}: PageSeoProps) {
  const fullTitle = `${title} | Raw School`;
  const fullCanonicalUrl = canonicalUrl
    ? `https://raw-visual.vercel.app${canonicalUrl}`
    : "https://raw-visual.vercel.app";
  const fullOgImage = ogImage.startsWith("http")
    ? ogImage
    : `https://raw-visual.vercel.app${ogImage}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />

      {/* Additional SEO elements passed as children */}
      {children}
    </Head>
  );
}
