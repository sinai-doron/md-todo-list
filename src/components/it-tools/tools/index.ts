/**
 * IT Tools Registry
 *
 * To add a new tool:
 * 1. Create a new component in this directory (e.g., MyTool.tsx)
 * 2. Import it here
 * 3. Add it to the `tools` array below
 */

import { Base64Tool } from './Base64Tool';
import { JWTTool } from './JWTTool';
import { ColorConverterTool } from './ColorConverterTool';
import { TextDiffTool } from './TextDiffTool';
import { UUIDGeneratorTool } from './UUIDGeneratorTool';
import { HashGeneratorTool } from './HashGeneratorTool';
import { URLEncoderTool } from './URLEncoderTool';
import { JSONFormatterTool } from './JSONFormatterTool';
import { TimestampConverterTool } from './TimestampConverterTool';
import { RegexTesterTool } from './RegexTesterTool';
import { LoremIpsumTool } from './LoremIpsumTool';
import { CaseConverterTool } from './CaseConverterTool';
import { NumberBaseConverterTool } from './NumberBaseConverterTool';
import { PasswordGeneratorTool } from './PasswordGeneratorTool';
import { HTMLEntityTool } from './HTMLEntityTool';
import { SlugGeneratorTool } from './SlugGeneratorTool';
import { WordCounterTool } from './WordCounterTool';
import { QRCodeTool } from './QRCodeTool';
import { CronParserTool } from './CronParserTool';
import { ByteCalculatorTool } from './ByteCalculatorTool';
import { YAMLJSONTool } from './YAMLJSONTool';
import { IPAddressTool } from './IPAddressTool';
import { MarkdownPreviewTool } from './MarkdownPreviewTool';
import { SQLFormatterTool } from './SQLFormatterTool';
import type { ITTool, ToolCategory, ToolCategoryInfo } from '../../../types/ITTool';

// Category definitions
export const categories: ToolCategoryInfo[] = [
  { id: 'encoding', name: 'Encoding', icon: 'code' },
  { id: 'crypto', name: 'Crypto & Security', icon: 'lock' },
  { id: 'formatting', name: 'Formatting', icon: 'format_align_left' },
  { id: 'conversion', name: 'Conversion', icon: 'swap_horiz' },
  { id: 'generators', name: 'Generators', icon: 'auto_awesome' },
  { id: 'validators', name: 'Validators', icon: 'check_circle' },
];

// Tool registry - add new tools here
export const tools: ITTool[] = [
  {
    id: 'base64',
    name: 'Base64 Encoder/Decoder',
    description: 'Encode and decode Base64 strings',
    icon: 'data_object',
    category: 'encoding',
    keywords: ['base64', 'encode', 'decode', 'binary', 'text'],
    component: Base64Tool,
  },
  {
    id: 'jwt',
    name: 'JWT Decoder',
    description: 'Decode and inspect JSON Web Tokens',
    icon: 'token',
    category: 'crypto',
    keywords: ['jwt', 'token', 'json', 'web', 'auth', 'decode', 'bearer'],
    component: JWTTool,
  },
  {
    id: 'color-converter',
    name: 'Color Converter',
    description: 'Convert colors between hex, rgb, hsl, hwb, lch, cmyk formats',
    icon: 'palette',
    category: 'conversion',
    keywords: ['color', 'hex', 'rgb', 'hsl', 'hwb', 'lch', 'cmyk', 'convert', 'picker', 'css'],
    component: ColorConverterTool,
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two texts and highlight differences',
    icon: 'difference',
    category: 'formatting',
    keywords: ['diff', 'compare', 'text', 'difference', 'merge', 'changes', 'compare'],
    component: TextDiffTool,
  },
  {
    id: 'uuid-generator',
    name: 'UUID Generator',
    description: 'Generate random UUIDs (v1 and v4)',
    icon: 'fingerprint',
    category: 'generators',
    keywords: ['uuid', 'guid', 'unique', 'identifier', 'random', 'generate'],
    component: UUIDGeneratorTool,
  },
  {
    id: 'hash-generator',
    name: 'Hash Generator',
    description: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes',
    icon: 'tag',
    category: 'crypto',
    keywords: ['hash', 'md5', 'sha', 'sha256', 'sha512', 'checksum', 'digest'],
    component: HashGeneratorTool,
  },
  {
    id: 'url-encoder',
    name: 'URL Encoder/Decoder',
    description: 'Encode or decode URLs and query parameters',
    icon: 'link',
    category: 'encoding',
    keywords: ['url', 'encode', 'decode', 'uri', 'percent', 'query', 'parameter'],
    component: URLEncoderTool,
  },
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Format, validate, and minify JSON data',
    icon: 'data_object',
    category: 'formatting',
    keywords: ['json', 'format', 'prettify', 'minify', 'validate', 'beautify'],
    component: JSONFormatterTool,
  },
  {
    id: 'timestamp-converter',
    name: 'Timestamp Converter',
    description: 'Convert between Unix timestamps and human-readable dates',
    icon: 'schedule',
    category: 'conversion',
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time', 'convert', 'datetime'],
    component: TimestampConverterTool,
  },
  {
    id: 'regex-tester',
    name: 'Regex Tester',
    description: 'Test and debug regular expressions with live matching',
    icon: 'code',
    category: 'validators',
    keywords: ['regex', 'regexp', 'regular', 'expression', 'pattern', 'test', 'match'],
    component: RegexTesterTool,
  },
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text for designs and mockups',
    icon: 'menu_book',
    category: 'generators',
    keywords: ['lorem', 'ipsum', 'placeholder', 'text', 'dummy', 'generate', 'filler'],
    component: LoremIpsumTool,
  },
  {
    id: 'case-converter',
    name: 'Case Converter',
    description: 'Convert text between camelCase, snake_case, PascalCase, and more',
    icon: 'swap_horiz',
    category: 'conversion',
    keywords: ['case', 'convert', 'camel', 'snake', 'pascal', 'kebab', 'uppercase', 'lowercase'],
    component: CaseConverterTool,
  },
  {
    id: 'number-base-converter',
    name: 'Number Base Converter',
    description: 'Convert numbers between binary, octal, decimal, and hexadecimal',
    icon: 'tag',
    category: 'conversion',
    keywords: ['binary', 'hex', 'hexadecimal', 'octal', 'decimal', 'base', 'convert', 'number'],
    component: NumberBaseConverterTool,
  },
  {
    id: 'password-generator',
    name: 'Password Generator',
    description: 'Generate secure, random passwords with customizable options',
    icon: 'lock',
    category: 'generators',
    keywords: ['password', 'generate', 'random', 'secure', 'strong', 'secret'],
    component: PasswordGeneratorTool,
  },
  {
    id: 'html-entity',
    name: 'HTML Entity Encoder',
    description: 'Encode and decode HTML entities',
    icon: 'code',
    category: 'encoding',
    keywords: ['html', 'entity', 'encode', 'decode', 'escape', 'special', 'characters'],
    component: HTMLEntityTool,
  },
  {
    id: 'slug-generator',
    name: 'Slug Generator',
    description: 'Convert text into URL-friendly slugs',
    icon: 'link',
    category: 'generators',
    keywords: ['slug', 'url', 'seo', 'friendly', 'permalink', 'convert'],
    component: SlugGeneratorTool,
  },
  {
    id: 'word-counter',
    name: 'Word & Character Counter',
    description: 'Count words, characters, sentences, and reading time',
    icon: 'text_fields',
    category: 'formatting',
    keywords: ['word', 'count', 'character', 'text', 'length', 'reading', 'time'],
    component: WordCounterTool,
  },
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, and more',
    icon: 'qr_code_2',
    category: 'generators',
    keywords: ['qr', 'code', 'generate', 'barcode', 'scan', 'url'],
    component: QRCodeTool,
  },
  {
    id: 'cron-parser',
    name: 'Cron Parser',
    description: 'Parse and explain cron expressions',
    icon: 'schedule',
    category: 'validators',
    keywords: ['cron', 'schedule', 'parse', 'job', 'timer', 'expression'],
    component: CronParserTool,
  },
  {
    id: 'byte-calculator',
    name: 'Byte Size Calculator',
    description: 'Convert between bytes, KB, MB, GB, TB, and more',
    icon: 'storage',
    category: 'conversion',
    keywords: ['byte', 'size', 'convert', 'kb', 'mb', 'gb', 'tb', 'storage', 'file'],
    component: ByteCalculatorTool,
  },
  {
    id: 'yaml-json',
    name: 'YAML ↔ JSON Converter',
    description: 'Convert between YAML and JSON formats',
    icon: 'swap_horiz',
    category: 'conversion',
    keywords: ['yaml', 'json', 'convert', 'config', 'format', 'data'],
    component: YAMLJSONTool,
  },
  {
    id: 'ip-address',
    name: 'IP Address Analyzer',
    description: 'Analyze IPv4 addresses, subnets, and CIDR notation',
    icon: 'router',
    category: 'validators',
    keywords: ['ip', 'address', 'subnet', 'cidr', 'network', 'ipv4', 'mask'],
    component: IPAddressTool,
  },
  {
    id: 'markdown-preview',
    name: 'Markdown Preview',
    description: 'Write markdown and preview the rendered output',
    icon: 'preview',
    category: 'formatting',
    keywords: ['markdown', 'preview', 'md', 'render', 'editor', 'text'],
    component: MarkdownPreviewTool,
  },
  {
    id: 'sql-formatter',
    name: 'SQL Formatter',
    description: 'Format and beautify SQL queries',
    icon: 'database',
    category: 'formatting',
    keywords: ['sql', 'format', 'query', 'beautify', 'database', 'prettify'],
    component: SQLFormatterTool,
  },
];

// Helper to get tool by ID
export const getToolById = (id: string): ITTool | undefined =>
  tools.find(t => t.id === id);

// Helper to get tools by category
export const getToolsByCategory = (category: ToolCategory): ITTool[] =>
  tools.filter(t => t.category === category);

// Helper to search tools
export const searchTools = (query: string): ITTool[] => {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return tools;

  return tools.filter(tool =>
    tool.name.toLowerCase().includes(lowerQuery) ||
    tool.description.toLowerCase().includes(lowerQuery) ||
    tool.keywords.some(k => k.toLowerCase().includes(lowerQuery))
  );
};

// Get categories that have tools
export const getActiveCategories = (): ToolCategoryInfo[] => {
  const activeIds = new Set(tools.map(t => t.category));
  return categories.filter(c => activeIds.has(c.id));
};
