import { create } from 'zustand';
import type {
  Recipe,
  GroceryItem,
  TimerState,
  CookingSession,
} from '../types/Recipe';
import { generateId, scaleQuantity } from '../types/Recipe';
import {
  loadRecipes,
  saveRecipes,
  loadGroceryList,
  saveGroceryList,
  loadServingsMap,
  saveServingsMap,
} from '../utils/recipeStorage';

interface RecipeStore {
  // Recipes
  recipes: Recipe[];
  selectedRecipeId: string | null;

  // Servings (per recipe)
  servingsMap: Record<string, number>;

  // Grocery list
  groceryItems: GroceryItem[];
  showCompletedGroceries: boolean;

  // Cooking session
  cookingSession: CookingSession | null;

  // Timers
  activeTimers: TimerState[];

  // Recipe actions
  loadFromStorage: () => void;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Recipe;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  selectRecipe: (id: string | null) => void;

  // Servings actions
  setServings: (recipeId: string, servings: number) => void;
  getServings: (recipeId: string) => number;

  // Grocery actions
  addToGroceryList: (recipeId: string) => void;
  removeFromGroceryList: (recipeId: string) => void;
  toggleGroceryItem: (itemId: string) => void;
  clearGroceryList: () => void;
  toggleShowCompletedGroceries: () => void;

  // Cooking actions
  startCooking: (recipeId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  endCooking: () => void;

  // Timer actions
  startTimer: (stepId: string, recipeId: string, duration: number) => void;
  pauseTimer: (stepId: string) => void;
  resumeTimer: (stepId: string) => void;
  resetTimer: (stepId: string) => void;
  removeTimer: (stepId: string) => void;
  tickTimers: () => void;

  // Session actions
  resetCookingSession: (recipeId: string) => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  // Initial state
  recipes: [],
  selectedRecipeId: null,
  servingsMap: {},
  groceryItems: [],
  showCompletedGroceries: true,
  cookingSession: null,
  activeTimers: [],

  // Load from localStorage
  loadFromStorage: () => {
    const recipes = loadRecipes();
    const groceryItems = loadGroceryList();
    const servingsMap = loadServingsMap();
    set({ recipes, groceryItems, servingsMap });
  },

  // Recipe CRUD
  addRecipe: (recipeData) => {
    const now = Date.now();
    const newRecipe: Recipe = {
      ...recipeData,
      id: generateId('recipe'),
      createdAt: now,
      updatedAt: now,
    };

    set((state) => {
      const recipes = [...state.recipes, newRecipe];
      saveRecipes(recipes);
      return { recipes };
    });

    return newRecipe;
  },

  updateRecipe: (id, updates) => {
    set((state) => {
      const recipes = state.recipes.map((recipe) =>
        recipe.id === id
          ? { ...recipe, ...updates, updatedAt: Date.now() }
          : recipe
      );
      saveRecipes(recipes);
      return { recipes };
    });
  },

  deleteRecipe: (id) => {
    set((state) => {
      const recipes = state.recipes.filter((recipe) => recipe.id !== id);
      // Also remove from grocery list
      const groceryItems = state.groceryItems.filter((item) => item.recipeId !== id);
      // Remove from servings map
      const servingsMap = { ...state.servingsMap };
      delete servingsMap[id];

      saveRecipes(recipes);
      saveGroceryList(groceryItems);
      saveServingsMap(servingsMap);

      return {
        recipes,
        groceryItems,
        servingsMap,
        selectedRecipeId: state.selectedRecipeId === id ? null : state.selectedRecipeId,
      };
    });
  },

  selectRecipe: (id) => {
    set({ selectedRecipeId: id });
  },

  // Servings
  setServings: (recipeId, servings) => {
    set((state) => {
      const servingsMap = { ...state.servingsMap, [recipeId]: servings };
      saveServingsMap(servingsMap);
      return { servingsMap };
    });
  },

  getServings: (recipeId) => {
    const state = get();
    const recipe = state.recipes.find((r) => r.id === recipeId);
    return state.servingsMap[recipeId] ?? recipe?.defaultServings ?? 4;
  },

  // Grocery list
  addToGroceryList: (recipeId) => {
    const state = get();
    const recipe = state.recipes.find((r) => r.id === recipeId);
    if (!recipe) return;

    const servings = state.getServings(recipeId);
    const scale = servings / recipe.defaultServings;

    // Create grocery items from ingredients
    const newItems: GroceryItem[] = recipe.ingredients.map((ing) => ({
      ...ing,
      id: generateId('grocery'),
      recipeId,
      recipeName: recipe.title,
      bought: false,
      scaledQuantity: scaleQuantity(ing.quantity, scale),
    }));

    set((state) => {
      // Remove existing items from this recipe first
      const filteredItems = state.groceryItems.filter((item) => item.recipeId !== recipeId);
      const groceryItems = [...filteredItems, ...newItems];
      saveGroceryList(groceryItems);
      return { groceryItems };
    });
  },

  removeFromGroceryList: (recipeId) => {
    set((state) => {
      const groceryItems = state.groceryItems.filter((item) => item.recipeId !== recipeId);
      saveGroceryList(groceryItems);
      return { groceryItems };
    });
  },

  toggleGroceryItem: (itemId) => {
    set((state) => {
      const groceryItems = state.groceryItems.map((item) =>
        item.id === itemId ? { ...item, bought: !item.bought } : item
      );
      saveGroceryList(groceryItems);
      return { groceryItems };
    });
  },

  clearGroceryList: () => {
    set({ groceryItems: [] });
    saveGroceryList([]);
  },

  toggleShowCompletedGroceries: () => {
    set((state) => ({ showCompletedGroceries: !state.showCompletedGroceries }));
  },

  // Cooking session
  startCooking: (recipeId) => {
    const state = get();
    const servings = state.getServings(recipeId);
    set({
      cookingSession: {
        recipeId,
        currentStepIndex: 0,
        servings,
        startedAt: Date.now(),
      },
    });
  },

  nextStep: () => {
    set((state) => {
      if (!state.cookingSession) return state;
      const recipe = state.recipes.find((r) => r.id === state.cookingSession?.recipeId);
      if (!recipe) return state;

      const maxIndex = recipe.steps.length - 1;
      const newIndex = Math.min(state.cookingSession.currentStepIndex + 1, maxIndex);

      return {
        cookingSession: {
          ...state.cookingSession,
          currentStepIndex: newIndex,
        },
      };
    });
  },

  prevStep: () => {
    set((state) => {
      if (!state.cookingSession) return state;
      const newIndex = Math.max(state.cookingSession.currentStepIndex - 1, 0);

      return {
        cookingSession: {
          ...state.cookingSession,
          currentStepIndex: newIndex,
        },
      };
    });
  },

  goToStep: (index) => {
    set((state) => {
      if (!state.cookingSession) return state;
      return {
        cookingSession: {
          ...state.cookingSession,
          currentStepIndex: index,
        },
      };
    });
  },

  endCooking: () => {
    set({ cookingSession: null, activeTimers: [] });
  },

  // Timers
  startTimer: (stepId, recipeId, duration) => {
    set((state) => {
      // Check if timer already exists
      const existing = state.activeTimers.find((t) => t.stepId === stepId);
      if (existing) {
        // Resume if paused
        return {
          activeTimers: state.activeTimers.map((t) =>
            t.stepId === stepId ? { ...t, isRunning: true } : t
          ),
        };
      }

      // Create new timer
      const newTimer: TimerState = {
        stepId,
        recipeId,
        remaining: duration,
        isRunning: true,
        totalDuration: duration,
      };

      return {
        activeTimers: [...state.activeTimers, newTimer],
      };
    });
  },

  pauseTimer: (stepId) => {
    set((state) => ({
      activeTimers: state.activeTimers.map((t) =>
        t.stepId === stepId ? { ...t, isRunning: false } : t
      ),
    }));
  },

  resumeTimer: (stepId) => {
    set((state) => ({
      activeTimers: state.activeTimers.map((t) =>
        t.stepId === stepId ? { ...t, isRunning: true } : t
      ),
    }));
  },

  resetTimer: (stepId) => {
    set((state) => ({
      activeTimers: state.activeTimers.map((t) =>
        t.stepId === stepId
          ? { ...t, remaining: t.totalDuration, isRunning: false }
          : t
      ),
    }));
  },

  removeTimer: (stepId) => {
    set((state) => ({
      activeTimers: state.activeTimers.filter((t) => t.stepId !== stepId),
    }));
  },

  // Called every second to update running timers
  tickTimers: () => {
    set((state) => ({
      activeTimers: state.activeTimers.map((timer) => {
        if (timer.isRunning && timer.remaining > 0) {
          return { ...timer, remaining: timer.remaining - 1 };
        }
        return timer;
      }),
    }));
  },

  // Reset cooking session - clears timers and resets servings to default
  resetCookingSession: (recipeId: string) => {
    const state = get();
    // Clear timers for this recipe
    const activeTimers = state.activeTimers.filter((t) => t.recipeId !== recipeId);
    // Reset servings to default (delete from map, falls back to defaultServings)
    const servingsMap = { ...state.servingsMap };
    delete servingsMap[recipeId];
    saveServingsMap(servingsMap);
    set({ activeTimers, servingsMap });
  },
}));
