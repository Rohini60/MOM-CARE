import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { sanitizeForFirestore } from './sanitize';
import type { UserProfile } from '../../types';
import { getDemoProfile, saveDemoProfile, clearDemoData } from '../demoStore';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (userId === 'demo_maya_uid') {
    return getDemoProfile();
  }
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (profile.id === 'demo_maya_uid') {
    saveDemoProfile(profile);
    return;
  }
  const path = `users/${profile.id}`;
  try {
    const cleanData = sanitizeForFirestore(profile);
    await setDoc(doc(db, 'users', profile.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateUserProfile(userId: string, partial: Partial<UserProfile>): Promise<void> {
  if (!auth.currentUser || userId === 'demo_maya_uid' || auth.currentUser.uid !== userId) {
    const current = getDemoProfile();
    saveDemoProfile({ ...current, ...partial, updatedAt: new Date().toISOString() });
    return;
  }
  const path = `users/${userId}`;
  try {
    const cleanData = sanitizeForFirestore({
      ...partial,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'users', userId), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Complete "Delete My Data" feature as required in Section 29
export async function deleteUserData(userId: string): Promise<void> {
  if (!auth.currentUser || userId === 'demo_maya_uid' || auth.currentUser.uid !== userId) {
    clearDemoData();
    return;
  }
  const subcollections = [
    'checkins',
    'symptoms',
    'care_tasks',
    'appointments',
    'medications',
    'medical_reports',
    'ai_conversations',
  ];

  for (const sub of subcollections) {
    try {
      const snap = await getDocs(collection(db, 'users', userId, sub));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (error) {
      console.warn(`Could not delete subcollection ${sub}:`, error);
    }
  }

  const userDocPath = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, userDocPath);
  }
}
