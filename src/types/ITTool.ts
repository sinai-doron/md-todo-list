/**
 * IT Tool Plugin System Type Definitions
 */

export type ToolCategory =
  | 'encoding'      // Base64, URL encode, HTML entities
  | 'crypto'        // Hash, JWT, UUID
  | 'formatting'    // JSON, XML, SQL formatter
  | 'conversion'    // Units, colors, timestamps
  | 'generators'    // Lorem ipsum, passwords, UUIDs
  | 'validators';   // JSON, regex, email

export interface ITTool {
  /** Unique identifier (e.g., 'base64') */
  id: string;
  /** Display name (e.g., 'Base64 Encoder') */
  name: string;
  /** Short description */
  description: string;
  /** Material icon name */
  icon: string;
  /** Category for grouping in sidebar */
  category: ToolCategory;
  /** Keywords for search in command palette */
  keywords: string[];
  /** The tool component itself */
  component: React.ComponentType;
}

export interface ToolCategoryInfo {
  id: ToolCategory;
  name: string;
  icon: string;
}
