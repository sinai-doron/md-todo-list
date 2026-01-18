import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { getUserId } from './auth';

// Get the user's base path
const getUserPath = () => `users/${getUserId()}`;

// ============ Generic CRUD Operations ============

// Get a single document
export const getDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, getUserPath(), collectionName, docId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as T) : null;
};

// Get all documents in a collection
export const getCollection = async <T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> => {
  const collRef = collection(db, getUserPath(), collectionName);
  const q = constraints.length > 0 ? query(collRef, ...constraints) : collRef;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
};

// Set a document (creates or overwrites)
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  const docRef = doc(db, getUserPath(), collectionName, docId);
  await setDoc(docRef, data);
};

// Update a document (partial update)
export const updateDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<void> => {
  const docRef = doc(db, getUserPath(), collectionName, docId);
  await updateDoc(docRef, data as DocumentData);
};

// Delete a document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  const docRef = doc(db, getUserPath(), collectionName, docId);
  await deleteDoc(docRef);
};

// ============ Real-time Listeners ============

// Subscribe to a single document
export const subscribeToDocument = <T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): Unsubscribe => {
  const docRef = doc(db, getUserPath(), collectionName, docId);
  return onSnapshot(docRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as T) : null);
  });
};

// Subscribe to a collection
export const subscribeToCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe => {
  const collRef = collection(db, getUserPath(), collectionName);
  const q = constraints.length > 0 ? query(collRef, ...constraints) : collRef;
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  });
};

// ============ Batch Operations ============

// Set multiple documents at once
export const setDocuments = async <T extends DocumentData>(
  collectionName: string,
  documents: { id: string; data: T }[]
): Promise<void> => {
  const promises = documents.map(({ id, data }) =>
    setDocument(collectionName, id, data)
  );
  await Promise.all(promises);
};

// Delete multiple documents
export const deleteDocuments = async (
  collectionName: string,
  docIds: string[]
): Promise<void> => {
  const promises = docIds.map((id) => deleteDocument(collectionName, id));
  await Promise.all(promises);
};

// Re-export query helpers for convenience
export { where, orderBy };

// ============ Global Collections (not user-scoped) ============

// Get a document from a global collection (no user path)
export const getGlobalDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  const docRef = doc(db, collectionName, docId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null;
};

// Get all documents from a global collection (no user path)
export const getGlobalCollection = async <T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> => {
  const collRef = collection(db, collectionName);
  const q = constraints.length > 0 ? query(collRef, ...constraints) : collRef;
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
};

// Subscribe to a global collection (no user path)
export const subscribeToGlobalCollection = <T>(
  collectionName: string,
  callback: (data: T[]) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe => {
  const collRef = collection(db, collectionName);
  const q = constraints.length > 0 ? query(collRef, ...constraints) : collRef;
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  });
};

// Set a document in a global collection (admin use only)
export const setGlobalDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  const docRef = doc(db, collectionName, docId);
  await setDoc(docRef, data);
};
