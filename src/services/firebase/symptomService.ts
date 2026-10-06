import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { sanitizeForFirestore } from './sanitize';
import type { SymptomRecord } from '../../types';
import { getDemoSymptoms, saveDemoSymptom } from '../demoStore';

export async function saveSymptomRecord(record: SymptomRecord): Promise<void> {
  if (record.userId === 'demo_maya_uid') {
    saveDemoSymptom(record);
    return;
  }
  const path = `users/${record.userId}/symptoms/${record.id}`;
  try {
    const cleanData = sanitizeForFirestore(record);
    await setDoc(doc(db, 'users', record.userId, 'symptoms', record.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function getRecentSymptoms(userId: string, count = 10): Promise<SymptomRecord[]> {
  if (userId === 'demo_maya_uid') {
    return getDemoSymptoms().slice(0, count);
  }
  const path = `users/${userId}/symptoms`;
  try {
    const q = query(
      collection(db, 'users', userId, 'symptoms'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as SymptomRecord);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}
