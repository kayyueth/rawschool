import React from "react";

/**
 * Formats text content by converting URLs to clickable links and handling text formatting
 * @param text The content text to format
 * @returns JSX elements with embedded links and formatting
 */
export function formatContentWithLinks(text: string): React.ReactNode {
  if (!text) return null;

  // First, process Markdown-style links, then handle formatting
  const processedWithLinks = processMarkdownLinks(text);

  // If we have an array (meaning links were found), we need to process each text node for formatting
  if (Array.isArray(processedWithLinks)) {
    return processedWithLinks.map((node, index) => {
      // If the node is a string, process formatting
      if (typeof node === "string") {
        return processFormatting(node, `format-${index}`);
      }
      // If it's a React element (link), return as is
      return node;
    });
  }

  // If no links were found, process the entire text for formatting
  return processFormatting(text);
}

/**
 * Process Markdown-style links in text
 */
function processMarkdownLinks(text: string): React.ReactNode[] | string {
  // Markdown-style link regex: [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Find all markdown links
  const markdownMatches = [...text.matchAll(markdownLinkRegex)];

  if (markdownMatches.length > 0) {
    for (const match of markdownMatches) {
      const [fullMatch, linkText, linkUrl] = match;
      const matchIndex = match.index || 0;

      // Add text before the link
      if (matchIndex > lastIndex) {
        const textBefore = text.substring(lastIndex, matchIndex);
        // Process any raw URLs in this segment
        elements.push(...processRawUrls(textBefore));
      }

      // Add the markdown link as an anchor element
      elements.push(
        <a
          key={`mdlink-${matchIndex}`}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {linkText}
        </a>
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    // Add any remaining text
    if (lastIndex < text.length) {
      const textAfter = text.substring(lastIndex);
      elements.push(...processRawUrls(textAfter));
    }

    return elements;
  }

  // If no markdown links, return the original text
  return text;
}

/**
 * Process text formatting (bold, italic)
 */
function processFormatting(
  text: string,
  keyPrefix: string = "format"
): React.ReactNode[] {
  // Bold: **text** or __text__
  const boldRegex = /(\*\*|__)([^*_]+)(\*\*|__)/g;
  // Italic: *text* or _text_
  const italicRegex = /(\*|_)([^*_]+)(\*|_)/g;

  let processedText = text;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Process bold formatting
  const boldMatches = [...text.matchAll(boldRegex)];
  if (boldMatches.length > 0) {
    for (const match of boldMatches) {
      const [fullMatch, openMark, content, closeMark] = match;
      const matchIndex = match.index || 0;

      // Add text before the formatting
      if (matchIndex > lastIndex) {
        elements.push(processedText.substring(lastIndex, matchIndex));
      }

      // Add the bold text
      elements.push(
        <strong key={`${keyPrefix}-bold-${matchIndex}`}>{content}</strong>
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < processedText.length) {
      elements.push(processedText.substring(lastIndex));
    }

    return elements;
  }

  // Process italic formatting if no bold was found
  const italicMatches = [...text.matchAll(italicRegex)];
  if (italicMatches.length > 0) {
    for (const match of italicMatches) {
      const [fullMatch, openMark, content, closeMark] = match;
      const matchIndex = match.index || 0;

      // Add text before the formatting
      if (matchIndex > lastIndex) {
        elements.push(processedText.substring(lastIndex, matchIndex));
      }

      // Add the italic text
      elements.push(
        <em key={`${keyPrefix}-italic-${matchIndex}`}>{content}</em>
      );

      lastIndex = matchIndex + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < processedText.length) {
      elements.push(processedText.substring(lastIndex));
    }

    return elements;
  }

  // Process any raw URLs if no formatting was found
  const urlElements = processRawUrls(text);
  if (urlElements.length > 1) {
    // More than 1 means URLs were found
    return urlElements;
  }

  // If no formatting or URLs were found, return the text as is
  return [text];
}

/**
 * Helper function to process raw URLs in text
 */
function processRawUrls(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const elements: React.ReactNode[] = [];

  // Split the text by URLs and create an array of elements
  const parts = text.split(urlRegex);

  // Find all URLs in the text
  const urls = text.match(urlRegex) || [];

  parts.forEach((part, index) => {
    // Add the text part
    elements.push(part);

    // Add the URL as a link if there is one at this position
    if (urls[index]) {
      elements.push(
        <a
          key={`link-${index}`}
          href={urls[index]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {urls[index]}
        </a>
      );
    }
  });

  return elements;
}
