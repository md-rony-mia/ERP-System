import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock Firebase SDKs before importing our code
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

const mockDoc: any = vi.fn((_db, collection, id) => ({ collection, id }));
const mockSetDoc: any = vi.fn();
const mockGetDocs: any = vi.fn();
const mockCollection: any = vi.fn((_db, name) => name);
const mockDeleteDoc: any = vi.fn();

const mockBatch = {
  set: vi.fn(),
  commit: vi.fn().mockResolvedValue(undefined),
};
const mockWriteBatch = vi.fn(() => mockBatch);

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: (a?: any, b?: any, c?: any) => {
    if (c !== undefined) return mockDoc(a, b, c);
    if (b !== undefined) return mockDoc(a, b);
    return mockDoc(a);
  },
  setDoc: (a?: any, b?: any, c?: any) => {
    if (c !== undefined) return mockSetDoc(a, b, c);
    return mockSetDoc(a, b);
  },
  getDocs: (a?: any) => mockGetDocs(a),
  collection: (a?: any, b?: any) => {
    if (b !== undefined) return mockCollection(a, b);
    return mockCollection(a);
  },
  deleteDoc: (a?: any) => mockDeleteDoc(a),
  writeBatch: () => mockWriteBatch(),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: [],
    },
  })),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

// Now import the functions to test
import {
  saveDocToFirestore,
  fetchCollectionFromFirestore,
  syncCollectionToFirestore,
} from '../lib/firebase';

describe('Firestore Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveDocToFirestore', () => {
    it('should save document successfully', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);
      const data = { id: 'prod1', name: 'Product 1' };

      await saveDocToFirestore('products', data);

      expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'products', 'prod1');
      expect(mockSetDoc).toHaveBeenCalledWith({ collection: 'products', id: 'prod1' }, data);
    });

    it('should handle setDoc errors with detailed custom exceptions', async () => {
      mockSetDoc.mockRejectedValueOnce(new Error('Permission Denied'));
      const data = { id: 'prod1', name: 'Product 1' };

      await expect(saveDocToFirestore('products', data)).rejects.toThrow('Permission Denied');
    });
  });

  describe('fetchCollectionFromFirestore', () => {
    it('should retrieve list of documents mapping doc ID and data', async () => {
      const mockDocs = [
        { id: '1', data: () => ({ name: 'Item 1' }) },
        { id: '2', data: () => ({ name: 'Item 2' }) },
      ];
      const mockQuerySnapshot = {
        forEach: (callback: any) => mockDocs.forEach((doc) => callback(doc)),
      };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot);

      const result = await fetchCollectionFromFirestore<{ id: string; name: string }>('products');

      expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'products');
      expect(mockGetDocs).toHaveBeenCalledWith('products');
      expect(result).toEqual([
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]);
    });

    it('should handle fetching errors gracefully', async () => {
      mockGetDocs.mockRejectedValueOnce(new Error('Network error'));
      await expect(fetchCollectionFromFirestore('products')).rejects.toThrow('Network error');
    });
  });

  describe('syncCollectionToFirestore', () => {
    it('should sync local array adding/updating active docs and deleting missing docs', async () => {
      // Setup current firestore database containing 'item-old' and 'item-stay'
      const mockDocs = [
        { id: 'item-old', data: () => ({ name: 'Old Item' }) },
        { id: 'item-stay', data: () => ({ name: 'Stay Item' }) },
      ];
      const mockQuerySnapshot = {
        forEach: (callback: any) => mockDocs.forEach((doc) => callback(doc)),
      };
      mockGetDocs.mockResolvedValueOnce(mockQuerySnapshot);
      mockSetDoc.mockResolvedValue(undefined);
      mockDeleteDoc.mockResolvedValue(undefined);

      // Local state has 'item-stay' (updated) and 'item-new' (new)
      const currentItems = [
        { id: 'item-stay', name: 'Stay Item Updated' },
        { id: 'item-new', name: 'New Item' },
      ];

      await syncCollectionToFirestore('products', currentItems);

      // Verify fetch collection first
      expect(mockGetDocs).toHaveBeenCalled();

      // Verify updates/adds
      expect(mockSetDoc).toHaveBeenCalledWith({ collection: 'products', id: 'item-stay' }, { id: 'item-stay', name: 'Stay Item Updated' });
      expect(mockSetDoc).toHaveBeenCalledWith({ collection: 'products', id: 'item-new' }, { id: 'item-new', name: 'New Item' });

      // Verify deletion of 'item-old' (it was in Firestore, but not in currentItems list)
      expect(mockDeleteDoc).toHaveBeenCalledWith({ collection: 'products', id: 'item-old' });
    });
  });
});
