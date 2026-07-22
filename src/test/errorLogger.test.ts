import { vi, describe, it, expect, beforeEach } from 'vitest';

const mockAddDoc: any = vi.fn();
const mockGetDocs: any = vi.fn();
const mockDeleteDoc: any = vi.fn();
const mockQuery: any = vi.fn((col, ...rules) => ({ col, rules }));
const mockOrderBy: any = vi.fn((field, dir) => ({ field, dir }));
const mockLimit: any = vi.fn((num) => ({ num }));
const mockCollection: any = vi.fn((_db, name) => name);
const mockDoc: any = vi.fn((...args: any[]) => ({ col: args[1], id: args[2] }));

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
    },
  })),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: (a?: any, b?: any) => (b !== undefined ? mockCollection(a, b) : mockCollection(a)),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
  query: (...args: any[]) => mockQuery(...args),
  orderBy: (...args: any[]) => mockOrderBy(...args),
  limit: (...args: any[]) => mockLimit(...args),
  doc: (a?: any, b?: any, c?: any) => (c !== undefined ? mockDoc(a, b, c) : mockDoc(a, b)),
}));

import { logErrorToFirestore, fetchErrorLogsFromFirestore, clearErrorLogsFromFirestore } from '../lib/errorLogger';

describe('ErrorLogger Subsystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write error logs to error_logs collection via addDoc', async () => {
    mockAddDoc.mockResolvedValueOnce({ id: 'log-123' });

    await logErrorToFirestore({
      message: 'Uncaught TypeError in Sales Module',
      stack: 'TypeError: Cannot read properties of null',
      userId: 'usr-1',
      userRole: 'Administrator',
      currentTab: 'sales',
    });

    expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'error_logs');
    expect(mockAddDoc).toHaveBeenCalledWith(
      'error_logs',
      expect.objectContaining({
        message: 'Uncaught TypeError in Sales Module',
        userId: 'usr-1',
        userRole: 'Administrator',
        currentTab: 'sales',
      })
    );
  });

  it('should fetch error log entries ordered by timestamp desc', async () => {
    const mockLogs = [
      { id: '1', data: () => ({ timestamp: '2026-07-22T00:00:00Z', message: 'Error 1' }) },
      { id: '2', data: () => ({ timestamp: '2026-07-22T01:00:00Z', message: 'Error 2' }) },
    ];
    mockGetDocs.mockResolvedValueOnce({
      forEach: (cb: any) => mockLogs.forEach((docSnap) => cb(docSnap)),
    });

    const logs = await fetchErrorLogsFromFirestore();

    expect(mockCollection).toHaveBeenCalledWith(expect.any(Object), 'error_logs');
    expect(mockQuery).toHaveBeenCalled();
    expect(logs).toHaveLength(2);
    expect(logs[0].id).toBe('1');
    expect(logs[0].message).toBe('Error 1');
  });

  it('should clear all error logs using deleteDoc', async () => {
    const mockLogs = [{ id: 'err-1', data: () => ({ timestamp: '2026-07-22T00:00:00Z', message: 'Error 1' }) }];
    mockGetDocs.mockResolvedValueOnce({
      forEach: (cb: any) => mockLogs.forEach((docSnap) => cb(docSnap)),
    });
    mockDeleteDoc.mockResolvedValue(undefined);

    await clearErrorLogsFromFirestore();

    expect(mockDoc).toHaveBeenCalledWith(expect.any(Object), 'error_logs', 'err-1');
    expect(mockDeleteDoc).toHaveBeenCalledWith({ col: 'error_logs', id: 'err-1' });
  });
});
