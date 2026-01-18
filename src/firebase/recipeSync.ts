// Recipe sync service - handles syncing recipes with Firestore
import type { Recipe, GroceryItem } from '../types/Recipe';
import {
  getCollection,
  setDocument,
  deleteDocument,
  subscribeToCollection,
  subscribeToDocument,
  setDocuments,
} from './firestore';

// Collection names
const RECIPES_COLLECTION = 'recipes';
const GROCERY_COLLECTION = 'groceryList';

// Types for Firestore data
interface RecipeSettings {
  servingsMap: Record<string, number>;
}

// Load all user recipes from Firestore
export const loadRecipesFromFirestore = async (): Promise<Recipe[]> => {
  try {
    const recipes = await getCollection<Recipe>(RECIPES_COLLECTION);
    return recipes;
  } catch (error) {
    console.error('Failed to load recipes from Firestore:', error);
    return [];
  }
};

// Save a single recipe to Firestore
export const saveRecipeToFirestore = async (recipe: Recipe): Promise<void> => {
  try {
    await setDocument(RECIPES_COLLECTION, recipe.id, recipe);
  } catch (error) {
    console.error('Failed to save recipe to Firestore:', error);
    throw error;
  }
};

// Delete a recipe from Firestore
export const deleteRecipeFromFirestore = async (recipeId: string): Promise<void> => {
  try {
    await deleteDocument(RECIPES_COLLECTION, recipeId);
  } catch (error) {
    console.error('Failed to delete recipe from Firestore:', error);
    throw error;
  }
};

// Load grocery list from Firestore
export const loadGroceryListFromFirestore = async (): Promise<GroceryItem[]> => {
  try {
    const items = await getCollection<GroceryItem>(GROCERY_COLLECTION);
    return items;
  } catch (error) {
    console.error('Failed to load grocery list from Firestore:', error);
    return [];
  }
};

// Save grocery list to Firestore (batch operation)
export const saveGroceryListToFirestore = async (items: GroceryItem[]): Promise<void> => {
  try {
    // Convert array to the format expected by setDocuments
    const documents = items.map((item) => ({
      id: item.id,
      data: item,
    }));
    await setDocuments(GROCERY_COLLECTION, documents);
  } catch (error) {
    console.error('Failed to save grocery list to Firestore:', error);
    throw error;
  }
};

// Clear grocery list from Firestore
export const clearGroceryListFromFirestore = async (): Promise<void> => {
  try {
    const items = await getCollection<GroceryItem>(GROCERY_COLLECTION);
    await Promise.all(items.map((item) => deleteDocument(GROCERY_COLLECTION, item.id)));
  } catch (error) {
    console.error('Failed to clear grocery list from Firestore:', error);
    throw error;
  }
};

// Load servings map from Firestore
export const loadServingsMapFromFirestore = async (): Promise<Record<string, number>> => {
  try {
    const settings = await getCollection<RecipeSettings>('settings');
    const recipeSettings = settings.find((s) => (s as { id?: string }).id === 'recipe-settings');
    return recipeSettings?.servingsMap ?? {};
  } catch (error) {
    console.error('Failed to load servings map from Firestore:', error);
    return {};
  }
};

// Save servings map to Firestore
export const saveServingsMapToFirestore = async (servingsMap: Record<string, number>): Promise<void> => {
  try {
    await setDocument('settings', 'recipe-settings', { servingsMap });
  } catch (error) {
    console.error('Failed to save servings map to Firestore:', error);
    throw error;
  }
};

// Subscribe to recipe changes (real-time sync)
export const subscribeToRecipes = (
  onUpdate: (recipes: Recipe[]) => void
): (() => void) => {
  return subscribeToCollection<Recipe>(RECIPES_COLLECTION, onUpdate);
};

// Subscribe to grocery list changes (real-time sync)
export const subscribeToGroceryList = (
  onUpdate: (items: GroceryItem[]) => void
): (() => void) => {
  return subscribeToCollection<GroceryItem>(GROCERY_COLLECTION, onUpdate);
};

// Subscribe to servings map changes (real-time sync)
export const subscribeToServingsMap = (
  onUpdate: (servingsMap: Record<string, number>) => void
): (() => void) => {
  return subscribeToDocument<RecipeSettings>(
    'settings',
    'recipe-settings',
    (data) => {
      onUpdate(data?.servingsMap ?? {});
    }
  );
};

// Migrate localStorage data to Firestore (one-time migration)
export const migrateLocalStorageToFirestore = async (
  userRecipes: Recipe[],
  groceryItems: GroceryItem[],
  servingsMap: Record<string, number>
): Promise<void> => {
  console.log('Migrating local data to Firestore...');

  try {
    // Save all recipes
    await Promise.all(userRecipes.map((recipe) => saveRecipeToFirestore(recipe)));
    console.log(`Migrated ${userRecipes.length} recipes`);

    // Save grocery list
    if (groceryItems.length > 0) {
      await saveGroceryListToFirestore(groceryItems);
      console.log(`Migrated ${groceryItems.length} grocery items`);
    }

    // Save servings map
    if (Object.keys(servingsMap).length > 0) {
      await saveServingsMapToFirestore(servingsMap);
      console.log('Migrated servings map');
    }

    console.log('Migration complete!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};
