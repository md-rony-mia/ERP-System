import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDocs, collection, writeBatch, deleteDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { AppSettings } from '../types';

export type { Unsubscribe };

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with custom databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  return signOut(auth);
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function createNewUserWithSecondaryApp(email: string, password: string, name: string, role: string, username: string) {
  let secondaryApp;
  const secondaryAppName = "SecondaryAppForUserCreation";
  const apps = getApps();
  const existingApp = apps.find(a => a.name === secondaryAppName);
  if (existingApp) {
    secondaryApp = existingApp;
  } else {
    secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
  }

  const secondaryAuth = getAuth(secondaryApp);
  
  // Create user
  const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const newUser = userCredential.user;
  const uid = newUser.uid;

  // Immediately sign out secondary auth so it doesn't leave active sessions
  await signOut(secondaryAuth);

  // Now create the Firestore document /users/{uid} using the primary db instance
  const userDocRef = doc(db, 'users', uid);
  await setDoc(userDocRef, {
    uid: uid,
    name: name,
    email: email,
    role: role,
    status: 'Active',
    username: username.toLowerCase().replace(/\s/g, '_'),
  });

  return { uid, email, name, role };
}

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
  // Intentionally silent: re-thrown immediately so caller catch blocks/UIs handle it
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
export async function saveSettingsToFirestore(settings: AppSettings) {
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
    console.warn(`Firestore fetch for [${collectionName}] encountered error:`, error);
    return [];
  }
}

/**
 * Subscribes to real-time updates for a collection in Firestore
 */
export function subscribeToCollection<T>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (querySnapshot) => {
      const items: T[] = [];
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as T);
      });
      onUpdate(items);
    },
    (error) => {
      console.warn(`Firestore subscription notice for [${collectionName}]:`, error);
    }
  );
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
    if (existing && existing.length > 0) {
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
    console.warn(`Firestore seed for [${collectionName}] encountered error:`, error);
    return initialData;
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

