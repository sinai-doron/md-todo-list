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
