import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// If the build pipeline didn't supply Firebase config, skip initialization
// so public pages (visualizer, landing, it-tools) still render. Auth-protected
// features will fail at use-site, which is correct: they can't work without
// real config anyway. Without this guard, getAuth() throws synchronously and
// crashes the entire React mount → blank page on every route.
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  _app = initializeApp(firebaseConfig);
  _auth = getAuth(_app);
  _db = getFirestore(_app);
  _storage = getStorage(_app);

  enableIndexedDbPersistence(_db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported in this browser');
    }
  });
} else {
  // Loud-enough warning for devs; quiet for end users (single console line).
  console.warn(
    '[firebase] Skipping initialization — VITE_FIREBASE_API_KEY is missing. ' +
      'Auth, Firestore, and Storage features will be disabled.',
  );
}

// Existing call sites import these as non-null. Keep that shape but type as
// nullable so future code is forced to handle the unconfigured case.
export const app = _app as FirebaseApp;
export const auth = _auth as Auth;
export const db = _db as Firestore;
export const storage = _storage as FirebaseStorage;
