import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, writeBatch, deleteDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0450547040",
  appId: "1:1084420946916:web:e473796d2be091d01425f1",
  apiKey: "AIzaSyBuW_riXThjgxEciGOYoeUORji6lP_-F9A",
  authDomain: "gen-lang-client-0450547040.firebaseapp.com",
  storageBucket: "gen-lang-client-0450547040.firebasestorage.app",
  messagingSenderId: "1084420946916"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = getFirestore(app, "ai-studio-axiomerp-10deb922-6cca-497b-86d2-a80d8e1b8236");
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Saves a single document to a collection in Firestore
 */
export async function saveDocToFirestore<T extends { id: string }>(
  collectionName: string,
  data: T
) {
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${data.id}`);
  }
}

/**
 * Saves settings to a single document 'app' in settings collection
 */
export async function saveSettingsToFirestore(settings: any) {
  try {
    const docRef = doc(db, 'settings', 'app');
    await setDoc(docRef, settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/app');
  }
}

/**
 * Fetches all documents from a collection
 */
export async function fetchCollectionFromFirestore<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as T);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, collectionName);
  }
}

/**
 * Seeds a collection in Firestore if it is empty
 */
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialData: T[]
): Promise<T[]> {
  try {
    const existing = await fetchCollectionFromFirestore<T>(collectionName);
    if (existing.length > 0) {
      return existing;
    }

    // Collection is empty, seed it
    const batch = writeBatch(db);
    initialData.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, item);
    });
    await batch.commit();
    return initialData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

/**
 * Synchronizes an array of items with a Firestore collection, adding/updating active items and deleting inactive ones
 */
export async function syncCollectionToFirestore<T extends { id: string }>(
  collectionName: string,
  currentItems: T[]
) {
  try {
    // 1. Fetch current IDs in Firestore
    const querySnapshot = await getDocs(collection(db, collectionName));
    const firestoreIds = new Set<string>();
    querySnapshot.forEach((doc) => {
      firestoreIds.add(doc.id);
    });

    // 2. Save/update all current items
    for (const item of currentItems) {
      const docRef = doc(db, collectionName, item.id);
      await setDoc(docRef, item);
      firestoreIds.delete(item.id);
    }

    // 3. Any leftover IDs in firestoreIds are deleted (since they are no longer in our list!)
    for (const idToDelete of firestoreIds) {
      const docRef = doc(db, collectionName, idToDelete);
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionName);
  }
}

