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
import { builtInRecipes as localBuiltInRecipes } from '../data/mockRecipes';
import {
  loadBuiltInRecipesFromFirestore,
  subscribeToBuiltInRecipes,
} from '../firebase/builtInRecipeSync';
import {
  loadRecipesFromFirestore,
  saveRecipeToFirestore,
  deleteRecipeFromFirestore,
  loadGroceryListFromFirestore,
  saveGroceryListToFirestore,
  clearGroceryListFromFirestore,
  loadServingsMapFromFirestore,
  saveServingsMapToFirestore,
  subscribeToRecipes,
  subscribeToGroceryList,
  subscribeToServingsMap,
  migrateLocalStorageToFirestore,
} from '../firebase/recipeSync';
import { isSignedIn } from '../firebase';

interface RecipeStore {
  // Built-in recipes (from Firestore or local fallback)
  builtInRecipes: Recipe[];
  // User recipes (stored in Firestore per user)
  userRecipes: Recipe[];
  // Combined: builtInRecipes + userRecipes
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

  // Sync state
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncError: string | null;

  // Recipe actions
  loadFromStorage: () => void;
  initializeFirebaseSync: () => Promise<() => void>;
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
  builtInRecipes: [...localBuiltInRecipes], // Start with local, update from Firestore
  userRecipes: [],
  recipes: [...localBuiltInRecipes], // Start with built-in recipes
  selectedRecipeId: null,
  servingsMap: {},
  groceryItems: [],
  showCompletedGroceries: true,
  cookingSession: null,
  activeTimers: [],
  isLoading: false,
  isSyncing: false,
  lastSyncError: null,

  // Load from localStorage - combines built-in with user recipes (fallback)
  loadFromStorage: () => {
    const userRecipes = loadRecipes();
    const groceryItems = loadGroceryList();
    const servingsMap = loadServingsMap();
    // Combine built-in recipes with user recipes
    const builtIn = get().builtInRecipes;
    const recipes = [...builtIn, ...userRecipes];
    set({ userRecipes, recipes, groceryItems, servingsMap });
  },

  // Initialize Firebase sync - loads from Firestore and sets up real-time listeners
  initializeFirebaseSync: async () => {
    set({ isLoading: true, lastSyncError: null });

    try {
      // Always load built-in recipes from Firestore (global collection)
      const builtIn = await loadBuiltInRecipesFromFirestore();
      set({ builtInRecipes: builtIn });

      if (!isSignedIn()) {
        console.log('Not signed in, using localStorage for user data');
        const userRecipes = loadRecipes();
        const groceryItems = loadGroceryList();
        const servingsMap = loadServingsMap();
        const recipes = [...builtIn, ...userRecipes];
        set({ userRecipes, recipes, groceryItems, servingsMap, isLoading: false });

        // Subscribe to built-in recipe updates only
        const unsubBuiltIn = subscribeToBuiltInRecipes((newBuiltIn) => {
          set((state) => {
            const recipes = [...newBuiltIn, ...state.userRecipes];
            return { builtInRecipes: newBuiltIn, recipes };
          });
        });

        return () => {
          unsubBuiltIn();
        };
      }

      // Load user data from Firestore
      const [firestoreRecipes, firestoreGrocery, firestoreServings] = await Promise.all([
        loadRecipesFromFirestore(),
        loadGroceryListFromFirestore(),
        loadServingsMapFromFirestore(),
      ]);

      // Check if we have local data that needs migration
      const localRecipes = loadRecipes();
      const localGrocery = loadGroceryList();
      const localServings = loadServingsMap();

      // If Firestore is empty but we have local data, migrate it
      if (firestoreRecipes.length === 0 && localRecipes.length > 0) {
        console.log('Migrating local data to Firestore...');
        await migrateLocalStorageToFirestore(localRecipes, localGrocery, localServings);
        // Use local data after migration
        const recipes = [...builtIn, ...localRecipes];
        set({ userRecipes: localRecipes, recipes, groceryItems: localGrocery, servingsMap: localServings });
      } else {
        // Use Firestore data
        const recipes = [...builtIn, ...firestoreRecipes];
        set({ userRecipes: firestoreRecipes, recipes, groceryItems: firestoreGrocery, servingsMap: firestoreServings });
      }

      // Set up real-time listeners for cross-device sync
      const unsubBuiltIn = subscribeToBuiltInRecipes((newBuiltIn) => {
        set((state) => {
          const recipes = [...newBuiltIn, ...state.userRecipes];
          return { builtInRecipes: newBuiltIn, recipes };
        });
      });

      const unsubRecipes = subscribeToRecipes((userRecipes) => {
        set((state) => {
          // Only update if not currently syncing (to avoid loops)
          if (state.isSyncing) return state;
          const combined = [...state.builtInRecipes, ...userRecipes];
          return { userRecipes, recipes: combined };
        });
      });

      const unsubGrocery = subscribeToGroceryList((items) => {
        set((state) => {
          if (state.isSyncing) return state;
          return { groceryItems: items };
        });
      });

      const unsubServings = subscribeToServingsMap((servingsMap) => {
        set((state) => {
          if (state.isSyncing) return state;
          return { servingsMap };
        });
      });

      set({ isLoading: false });

      // Return cleanup function
      return () => {
        unsubBuiltIn();
        unsubRecipes();
        unsubGrocery();
        unsubServings();
      };
    } catch (error) {
      console.error('Failed to initialize Firebase sync:', error);
      set({ lastSyncError: (error as Error).message, isLoading: false });
      // Fall back to localStorage
      get().loadFromStorage();
      return () => {};
    }
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
      const userRecipes = [...state.userRecipes, newRecipe];
      saveRecipes(userRecipes); // Keep localStorage as backup
      // Combine built-in + user recipes
      const recipes = [...state.builtInRecipes, ...userRecipes];
      return { userRecipes, recipes, isSyncing: true };
    });

    // Sync to Firestore
    if (isSignedIn()) {
      saveRecipeToFirestore(newRecipe)
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync new recipe:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }

    return newRecipe;
  },

  updateRecipe: (id, updates) => {
    const state = get();
    // Only allow updating user recipes (not built-in)
    const recipe = state.recipes.find((r) => r.id === id);
    if (recipe?.isBuiltIn) return;

    const updatedRecipe = { ...recipe, ...updates, updatedAt: Date.now() } as Recipe;

    set((state) => {
      const userRecipes = state.userRecipes.map((r) =>
        r.id === id ? updatedRecipe : r
      );
      saveRecipes(userRecipes); // Keep localStorage as backup
      // Combine built-in + user recipes
      const recipes = [...state.builtInRecipes, ...userRecipes];
      return { userRecipes, recipes, isSyncing: true };
    });

    // Sync to Firestore
    if (isSignedIn()) {
      saveRecipeToFirestore(updatedRecipe)
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync recipe update:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
  },

  deleteRecipe: (id) => {
    const state = get();
    // Cannot delete built-in recipes
    const recipe = state.recipes.find((r) => r.id === id);
    if (recipe?.isBuiltIn) return;

    const userRecipes = state.userRecipes.filter((recipe) => recipe.id !== id);
    // Also remove from grocery list
    const groceryItems = state.groceryItems.filter((item) => item.recipeId !== id);
    // Remove from servings map
    const servingsMap = { ...state.servingsMap };
    delete servingsMap[id];

    saveRecipes(userRecipes);
    saveGroceryList(groceryItems);
    saveServingsMap(servingsMap);

    // Combine built-in + user recipes
    const recipes = [...state.builtInRecipes, ...userRecipes];

    set({
      userRecipes,
      recipes,
      groceryItems,
      servingsMap,
      selectedRecipeId: state.selectedRecipeId === id ? null : state.selectedRecipeId,
      isSyncing: true,
    });

    // Sync to Firestore
    if (isSignedIn()) {
      Promise.all([
        deleteRecipeFromFirestore(id),
        saveGroceryListToFirestore(groceryItems),
        saveServingsMapToFirestore(servingsMap),
      ])
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync recipe deletion:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
  },

  selectRecipe: (id) => {
    set({ selectedRecipeId: id });
  },

  // Servings
  setServings: (recipeId, servings) => {
    const newServingsMap = { ...get().servingsMap, [recipeId]: servings };
    saveServingsMap(newServingsMap);
    set({ servingsMap: newServingsMap, isSyncing: true });

    // Sync to Firestore
    if (isSignedIn()) {
      saveServingsMapToFirestore(newServingsMap)
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync servings:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
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

    // Remove existing items from this recipe first
    const filteredItems = state.groceryItems.filter((item) => item.recipeId !== recipeId);
    const groceryItems = [...filteredItems, ...newItems];
    saveGroceryList(groceryItems);
    set({ groceryItems, isSyncing: true });

    // Sync to Firestore
    if (isSignedIn()) {
      saveGroceryListToFirestore(groceryItems)
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync grocery list:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
  },

  removeFromGroceryList: (recipeId) => {
    const groceryItems = get().groceryItems.filter((item) => item.recipeId !== recipeId);
    saveGroceryList(groceryItems);
    set({ groceryItems, isSyncing: true });

    // Sync to Firestore
    if (isSignedIn()) {
      saveGroceryListToFirestore(groceryItems)
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync grocery list:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
  },

  toggleGroceryItem: (itemId) => {
    const groceryItems = get().groceryItems.map((item) =>
      item.id === itemId ? { ...item, bought: !item.bought } : item
    );
    saveGroceryList(groceryItems);
    set({ groceryItems, isSyncing: true });

    // Sync to Firestore
    if (isSignedIn()) {
      saveGroceryListToFirestore(groceryItems)
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync grocery item:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
  },

  clearGroceryList: () => {
    set({ groceryItems: [], isSyncing: true });
    saveGroceryList([]);

    // Sync to Firestore
    if (isSignedIn()) {
      clearGroceryListFromFirestore()
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to clear grocery list:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
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
    set({ activeTimers, servingsMap, isSyncing: true });

    // Sync to Firestore
    if (isSignedIn()) {
      saveServingsMapToFirestore(servingsMap)
        .then(() => set({ isSyncing: false }))
        .catch((error) => {
          console.error('Failed to sync servings reset:', error);
          set({ isSyncing: false, lastSyncError: error.message });
        });
    } else {
      set({ isSyncing: false });
    }
  },
}));
