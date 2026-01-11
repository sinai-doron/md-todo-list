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
