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
import type { Checkin } from '../../types';
import { getDemoCheckins, saveDemoCheckin } from '../demoStore';

export async function saveDailyCheckin(checkin: Checkin): Promise<void> {
  if (checkin.userId === 'demo_maya_uid') {
    saveDemoCheckin(checkin);
    return;
  }
  const path = `users/${checkin.userId}/checkins/${checkin.id}`;
  try {
    const cleanData = sanitizeForFirestore(checkin);
    await setDoc(doc(db, 'users', checkin.userId, 'checkins', checkin.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function getRecentCheckins(userId: string, count = 14): Promise<Checkin[]> {
  if (userId === 'demo_maya_uid') {
    return getDemoCheckins().slice(0, count);
  }
  const path = `users/${userId}/checkins`;
  try {
    const q = query(
      collection(db, 'users', userId, 'checkins'),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as Checkin);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}
