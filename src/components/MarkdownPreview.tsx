import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styled from 'styled-components';

// Extended sanitization schema to allow GitHub-style HTML elements
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'details',
    'summary',
    'kbd',
    'mark',
    'abbr',
    'sub',
    'sup',
    'ins',
    'var',
    'samp',
    'dfn',
    'figure',
    'figcaption',
    'picture',
    'source',
    'video',
    'audio',
  ],
  attributes: {
    ...defaultSchema.attributes,
    details: ['open'],
    abbr: ['title'],
    video: ['src', 'controls', 'width', 'height', 'poster', 'preload'],
    audio: ['src', 'controls'],
    source: ['src', 'type'],
    img: [...(defaultSchema.attributes?.img || []), 'loading', 'decoding'],
  },
};

const PreviewContainer = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #333;

  h1, h2, h3, h4, h5, h6 {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  h1 { font-size: 24px; }
  h2 { font-size: 20px; }
  h3 { font-size: 18px; }
  h4 { font-size: 16px; }
  h5 { font-size: 14px; }
  h6 { font-size: 13px; color: #666; }

  p {
    margin: 8px 0;
  }

  ul, ol {
    margin: 8px 0;
    padding-left: 24px;
  }

  li {
    margin: 4px 0;
  }

  li > ul, li > ol {
    margin: 4px 0;
  }

  code {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #d63384;
  }

  pre {
    background: #f4f4f4;
    padding: 12px;
    border-radius: 6px;
    overflow-x: auto;
    margin: 12px 0;

    code {
      background: none;
      padding: 0;
      color: #333;
    }
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 12px 0;
    font-size: 13px;
  }

  th, td {
    border: 1px solid #e0e0e0;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background: #f9f9f9;
    font-weight: 600;
  }

  tr:nth-child(even) {
    background: #fafafa;
  }

  a {
    color: #4a90e2;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 4px solid #6200ee;
    margin: 12px 0;
    padding: 8px 0 8px 16px;
    color: #666;
    background: #f9f9ff;
    border-radius: 0 4px 4px 0;
  }

  hr {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 16px 0;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }

  input[type="checkbox"] {
    margin-right: 8px;
  }

  /* Task list items from GFM */
  li.task-list-item {
    list-style: none;
    margin-left: -24px;
    padding-left: 24px;
  }

  del {
    color: #999;
  }

  /* HTML elements - GitHub style */
  details {
    margin: 12px 0;
    padding: 8px 12px;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
  }

  details[open] {
    padding-bottom: 12px;
  }

  summary {
    cursor: pointer;
    font-weight: 600;
    padding: 4px 0;

    &:hover {
      color: #0969da;
    }
  }

  details[open] > summary {
    margin-bottom: 8px;
    border-bottom: 1px solid #d0d7de;
    padding-bottom: 8px;
  }

  kbd {
    display: inline-block;
    padding: 3px 6px;
    font-size: 11px;
    font-family: ui-monospace, monospace;
    line-height: 1;
    color: #24292f;
    vertical-align: middle;
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    box-shadow: inset 0 -1px 0 #d0d7de;
  }

  mark {
    background-color: #fff8c5;
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }

  abbr[title] {
    text-decoration: underline dotted;
    cursor: help;
  }

  sub, sup {
    font-size: 75%;
    line-height: 0;
    position: relative;
    vertical-align: baseline;
  }

  sup { top: -0.5em; }
  sub { bottom: -0.25em; }

  ins {
    background-color: #dafbe1;
    text-decoration: none;
    padding: 0.1em 0.3em;
    border-radius: 3px;
  }

  figure {
    margin: 16px 0;
    text-align: center;
  }

  figcaption {
    font-size: 12px;
    color: #666;
    margin-top: 8px;
    font-style: italic;
  }

  video, audio {
    max-width: 100%;
    border-radius: 6px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
  font-style: italic;

  .icon {
    font-size: 48px;
    margin-bottom: 12px;
    opacity: 0.5;
  }
`;

interface MarkdownPreviewProps {
  content: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content }) => {
  if (!content.trim()) {
    return (
      <EmptyState>
        <div className="icon">
          <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
            preview
          </span>
        </div>
        <p>Paste markdown or upload a file to see preview</p>
      </EmptyState>
    );
  }

  return (
    <PreviewContainer>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            // Check if this is an inline code or a code block
            const isInline = !match && !codeString.includes('\n');

            if (isInline) {
              return <code className={className} {...props}>{children}</code>;
            }

            return (
              <SyntaxHighlighter
                style={oneDark}
                language={match ? match[1] : 'text'}
                PreTag="div"
                customStyle={{
                  margin: '12px 0',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              >
                {codeString}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </PreviewContainer>
  );
};
