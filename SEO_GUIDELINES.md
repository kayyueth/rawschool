# SEO Guidelines for Raw School

This document outlines the SEO best practices to follow when developing and maintaining the Raw School website.

## Table of Contents

1. [Metadata](#metadata)
2. [Content Structure](#content-structure)
3. [Images](#images)
4. [Performance](#performance)
5. [Structured Data](#structured-data)
6. [URL Structure](#url-structure)
7. [Mobile Optimization](#mobile-optimization)
8. [Analytics and Monitoring](#analytics-and-monitoring)

## Metadata

- **Page Titles**: Each page should have a unique, descriptive title that includes relevant keywords. Format: `[Page Name] | Raw School`
- **Meta Descriptions**: Write compelling meta descriptions between 120-155 characters that include relevant keywords and a call to action.
- **Canonical URLs**: Always include canonical URLs to prevent duplicate content issues.
- **Open Graph and Twitter Cards**: Include these for better social media sharing.

## Content Structure

- **Headings**: Use proper heading hierarchy (H1, H2, H3, etc.) with H1 being used only once per page.
- **Content Quality**: Create original, valuable content that addresses user needs and questions.
- **Keyword Usage**: Include relevant keywords naturally in content, headings, and meta tags.
- **Internal Linking**: Link to other relevant pages within the site using descriptive anchor text.
- **Breadcrumbs**: Use the Breadcrumbs component for improved navigation and SEO.

## Images

- **Alt Text**: Always include descriptive alt text for images.
- **Image Optimization**: Use the OptimizedImage component to ensure images are properly sized and optimized.
- **Lazy Loading**: Implement lazy loading for images below the fold.
- **Image Formats**: Use modern formats like WebP or AVIF when possible.

## Performance

- **Core Web Vitals**: Regularly monitor and optimize for Core Web Vitals:
  - Largest Contentful Paint (LCP): < 2.5 seconds
  - First Input Delay (FID): < 100 milliseconds
  - Cumulative Layout Shift (CLS): < 0.1
- **Page Speed**: Aim for a page load time under 3 seconds.
- **Code Splitting**: Use Next.js's built-in code splitting to reduce initial load times.
- **Caching**: Implement proper caching strategies for static assets.

## Structured Data

- **JSON-LD**: Use the JSON-LD components to add structured data to pages:
  - OrganizationJsonLd: For organization information
  - WebsiteJsonLd: For website information
  - ArticleJsonLd: For blog posts or articles
- **Breadcrumb Markup**: Include breadcrumb structured data on all pages.
- **Schema Types**: Use appropriate schema.org types for different content.

## URL Structure

- **Clean URLs**: Use clean, descriptive URLs that include relevant keywords.
- **URL Parameters**: Minimize the use of URL parameters.
- **Trailing Slashes**: Be consistent with trailing slashes (we use them).
- **Hyphens**: Use hyphens (-) instead of underscores (\_) in URLs.

## Mobile Optimization

- **Responsive Design**: Ensure all pages are fully responsive and mobile-friendly.
- **Touch Targets**: Make sure buttons and links are large enough for mobile users (minimum 44x44 pixels).
- **Viewport Settings**: Use proper viewport settings in the HTML head.
- **Mobile Testing**: Regularly test the site on various mobile devices.

## Analytics and Monitoring

- **Google Search Console**: Set up and regularly check Google Search Console for issues.
- **Analytics**: Implement analytics to track user behavior and conversion goals.
- **Regular Audits**: Conduct regular SEO audits using tools like Lighthouse.
- **Monitoring**: Set up monitoring for broken links, crawl errors, and performance issues.

---

## Implementation Checklist

When implementing new pages or features, ensure the following:

- [ ] Page has unique title and meta description
- [ ] Proper heading structure is used
- [ ] Images have alt text and are optimized
- [ ] Structured data is implemented where appropriate
- [ ] Page is mobile-friendly
- [ ] Page loads quickly (< 3 seconds)
- [ ] Internal links use descriptive anchor text
- [ ] URL is clean and descriptive
- [ ] Breadcrumbs are implemented
- [ ] Page is added to the sitemap

## Tools and Resources

- [Google Search Console](https://search.google.com/search-console)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)
- [Schema.org](https://schema.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Mobile-Friendly Test](https://search.google.com/test/mobile-friendly)
