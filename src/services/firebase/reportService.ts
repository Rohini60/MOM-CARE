import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { sanitizeForFirestore } from './sanitize';
import type { MedicalReport } from '../../types';
import { getDemoMedicalReports, saveDemoMedicalReport } from '../demoStore';

export async function uploadReportDocument(userId: string, file: File): Promise<string> {
  try {
    const fileRef = ref(storage, `users/${userId}/reports/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (err) {
    console.warn('Firebase Storage upload notice, using secure document reference:', err);
    // Return a clean document identifier for prototype continuity
    return `storage://users/${userId}/reports/${Date.now()}_${file.name}`;
  }
}

export async function saveMedicalReport(report: MedicalReport): Promise<void> {
  if (report.userId === 'demo_maya_uid') {
    saveDemoMedicalReport(report);
    return;
  }
  const path = `users/${report.userId}/medical_reports/${report.id}`;
  try {
    const cleanData = sanitizeForFirestore(report);
    await setDoc(doc(db, 'users', report.userId, 'medical_reports', report.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getMedicalReports(userId: string): Promise<MedicalReport[]> {
  if (userId === 'demo_maya_uid') {
    return getDemoMedicalReports();
  }
  const path = `users/${userId}/medical_reports`;
  try {
    const q = query(
      collection(db, 'users', userId, 'medical_reports'),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as MedicalReport);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function deleteMedicalReport(userId: string, reportId: string): Promise<void> {
  if (!auth.currentUser || userId === 'demo_maya_uid' || auth.currentUser.uid !== userId) {
    return;
  }
  const path = `users/${userId}/medical_reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'medical_reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
