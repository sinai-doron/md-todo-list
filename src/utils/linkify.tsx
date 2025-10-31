import React from 'react';

/**
 * Converts text with markdown links and plain URLs into React elements with clickable links
 * Supports:
 * - Markdown links: [text](url)
 * - Plain URLs: http://example.com or https://example.com
 */
export function linkifyText(text: string): React.ReactNode {
  if (!text) return text;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // Combined regex to match markdown links or plain URLs
  // Markdown links: [text](url)
  // Plain URLs: http(s)://...
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s<>]+/g;
  
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Check if it's a markdown link or plain URL
    if (match[1] && match[2]) {
      // Markdown link: [text](url)
      const linkText = match[1];
      const url = match[2];
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: '#4a90e2',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {linkText}
        </a>
      );
    } else {
      // Plain URL
      const url = match[0];
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            color: '#4a90e2',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {url}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last match
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no matches found, return the original text
  return parts.length > 0 ? parts : text;
}

