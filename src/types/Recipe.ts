// Ingredient categories for grocery grouping (by aisle)
export type IngredientCategory =
  | 'produce'
  | 'dairy'
  | 'meat'
  | 'pantry'
  | 'frozen'
  | 'bakery'
  | 'spices'
  | 'other';

// Ingredient with scaling support
export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  notes?: string;
}

// Step with optional timer
export interface RecipeStep {
  id: string;
  order: number;
  description: string;
  timer?: number; // seconds
  tips?: string;
}

// Difficulty levels
export type Difficulty = 'easy' | 'medium' | 'hard';

// Supported languages
export type RecipeLanguage = 'en' | 'he' | 'ar' | 'fa' | 'ur';

// RTL languages
export const RTL_LANGUAGES: RecipeLanguage[] = ['he', 'ar', 'fa', 'ur'];

// Check if a language is RTL
export const isRTL = (language?: RecipeLanguage): boolean => {
  return language ? RTL_LANGUAGES.includes(language) : false;
};

// Nutrition information
export interface NutritionInfo {
  calories: number;
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

// Main Recipe interface
export interface Recipe {
  id: string;
  title: string;
  description: string;
  aboutDish?: string; // Extended description for detail view
  image?: string; // URL or base64
  prepTime: number; // minutes
  cookTime: number; // minutes
  difficulty: Difficulty;
  defaultServings: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  tags: string[];
  category: string;
  author?: string;
  sourceUrl?: string; // Original URL where recipe was imported from
  rating?: number; // 0-5 scale
  reviewCount?: number;
  nutrition?: NutritionInfo;
  chefTip?: string;
  language?: RecipeLanguage; // Language for RTL/LTR support
  createdAt: number;
  updatedAt: number;
}

// Grocery item (ingredient + bought state + recipe info)
export interface GroceryItem extends Ingredient {
  recipeId: string;
  recipeName: string;
  bought: boolean;
  scaledQuantity: number; // quantity after scaling
}

// Timer state for a step
export interface TimerState {
  stepId: string;
  recipeId: string;
  remaining: number; // seconds
  isRunning: boolean;
  totalDuration: number; // original duration in seconds
}

// Cooking session state
export interface CookingSession {
  recipeId: string;
  currentStepIndex: number;
  servings: number;
  startedAt: number;
}

// Recipe view modes
export type RecipeViewMode = 'reading' | 'supermarket' | 'cooking';

// Category display order for grocery grouping
export const CATEGORY_ORDER: IngredientCategory[] = [
  'produce',
  'dairy',
  'meat',
  'bakery',
  'frozen',
  'pantry',
  'spices',
  'other',
];

// Category display names
export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  produce: 'Produce',
  dairy: 'Dairy & Eggs',
  meat: 'Meat & Seafood',
  bakery: 'Bakery',
  frozen: 'Frozen',
  pantry: 'Pantry',
  spices: 'Spices & Seasonings',
  other: 'Other',
};

// Difficulty labels and colors
export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: '#22c55e' },
  medium: { label: 'Medium', color: '#f59e0b' },
  hard: { label: 'Hard', color: '#ef4444' },
};

// Helper: Scale ingredient quantity
export const scaleQuantity = (quantity: number, scale: number): number => {
  const scaled = quantity * scale;
  return Math.round(scaled * 100) / 100; // 2 decimal places
};

// Helper: Format time in minutes to display string
export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Helper: Format seconds to MM:SS
export const formatTimerDisplay = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Helper: Generate unique ID
export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Helper: Format quantity for display (converts decimals to fractions when appropriate)
export const formatQuantity = (quantity: number): string => {
  if (quantity === 0) return '0';

  // Handle common fractions
  const fractions: Record<number, string> = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.67: '2/3',
    0.75: '3/4',
  };

  const wholePart = Math.floor(quantity);
  const decimalPart = Math.round((quantity - wholePart) * 100) / 100;

  // Check if decimal part matches a common fraction
  let fractionStr = '';
  for (const [decimal, fraction] of Object.entries(fractions)) {
    if (Math.abs(decimalPart - parseFloat(decimal)) < 0.02) {
      fractionStr = fraction;
      break;
    }
  }

  if (wholePart === 0 && fractionStr) {
    return fractionStr;
  } else if (wholePart > 0 && fractionStr) {
    return `${wholePart} ${fractionStr}`;
  } else if (wholePart > 0 && decimalPart === 0) {
    return wholePart.toString();
  } else {
    // Show as decimal, removing trailing zeros
    return quantity.toFixed(2).replace(/\.?0+$/, '');
  }
};
