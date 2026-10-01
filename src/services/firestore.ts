import { 
  getFirestore, 
  doc, 
  collection, 
  getDocs, 
  getDocFromServer, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { auth } from './auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { SecurityOfficer } from '../types';

// CRITICAL: Initialize Firestore with custom databaseId if configured
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(auth.app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(auth.app);

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
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
 * Validates connection to Firestore server on boot
 */
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline or connection check failed.');
      return false;
    }
    // Expected to fail with permission denied on 'test/connection' due to fortress rules,
    // which confirms server reachability
    return true;
  }
}

/**
 * Listen to live officers collection from Firestore
 */
export function subscribeToOfficers(
  onUpdate: (officers: SecurityOfficer[]) => void,
  onError?: (err: Error) => void
) {
  const officersCol = collection(db, 'officers');
  const q = query(officersCol, orderBy('srNo', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const records: SecurityOfficer[] = [];
      snapshot.forEach((docSnap) => {
        records.push(docSnap.data() as SecurityOfficer);
      });
      onUpdate(records);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, 'officers');
    }
  );
}

/**
 * Save or update officer in Firestore
 */
export async function saveOfficerToFirestore(officer: SecurityOfficer): Promise<void> {
  const path = `officers/${officer.id}`;
  try {
    const docRef = doc(db, 'officers', officer.id);
    const payload = {
      ...officer,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.currentUser?.email || auth.currentUser?.uid || 'user'
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Delete officer from Firestore
 */
export async function deleteOfficerFromFirestore(officerId: string): Promise<void> {
  const path = `officers/${officerId}`;
  try {
    const docRef = doc(db, 'officers', officerId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Batch seed all officers to Firestore
 */
export async function batchSeedOfficersToFirestore(officers: SecurityOfficer[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const officer of officers) {
      const docRef = doc(db, 'officers', officer.id);
      batch.set(docRef, {
        ...officer,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'system'
      }, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'officers');
  }
}
