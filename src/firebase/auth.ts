import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

const googleProvider = new GoogleAuthProvider();

const FIREBASE_DISABLED_MSG =
  'Auth is unavailable: Firebase is not configured (VITE_FIREBASE_API_KEY missing).';

export const signInWithGoogle = async (): Promise<User> => {
  if (!isFirebaseConfigured) throw new Error(FIREBASE_DISABLED_MSG);
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const signOut = async (): Promise<void> => {
  if (!isFirebaseConfigured) return;
  await firebaseSignOut(auth);
};

export const getCurrentUser = (): User | null => {
  if (!isFirebaseConfigured) return null;
  return auth.currentUser;
};

// Subscribe to auth state changes. When Firebase is unconfigured, fire the
// callback once with `null` (signed-out state) and return a no-op unsubscribe.
export const onAuthChange = (callback: (user: User | null) => void): (() => void) => {
  if (!isFirebaseConfigured) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const getUserId = (): string => {
  if (!isFirebaseConfigured) throw new Error(FIREBASE_DISABLED_MSG);
  const user = auth.currentUser;
  if (!user) throw new Error('User not signed in');
  return user.uid;
};

export const isSignedIn = (): boolean => {
  if (!isFirebaseConfigured) return false;
  return auth.currentUser !== null;
};
