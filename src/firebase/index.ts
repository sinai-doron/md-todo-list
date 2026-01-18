// Firebase configuration and services
export { app, db, storage, auth } from './config';

// Authentication
export {
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthChange,
  getUserId,
  isSignedIn,
} from './auth';

// Auth context and hook
export { AuthProvider, useAuth } from './AuthContext';

// Firestore helpers
export {
  getDocument,
  getCollection,
  setDocument,
  updateDocument,
  deleteDocument,
  subscribeToDocument,
  subscribeToCollection,
  setDocuments,
  deleteDocuments,
  where,
  orderBy,
  // Global collections (not user-scoped)
  getGlobalDocument,
  getGlobalCollection,
  subscribeToGlobalCollection,
  setGlobalDocument,
} from './firestore';

// Recipe sync
export {
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
} from './recipeSync';

// Profile sync
export {
  loadProfile,
  saveProfile,
  updateProfile,
  createInitialProfile,
  subscribeToProfile,
  uploadAvatar,
  compressImage,
} from './profileSync';

// Built-in recipe sync (global collection)
export {
  loadBuiltInRecipesFromFirestore,
  subscribeToBuiltInRecipes,
  seedBuiltInRecipesToFirestore,
  clearBuiltInRecipesCache,
} from './builtInRecipeSync';
