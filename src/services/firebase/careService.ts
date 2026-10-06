import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { sanitizeForFirestore } from './sanitize';
import type { CareTask, Appointment, Medication } from '../../types';
import {
  getDemoCareTasks,
  saveDemoCareTask,
  toggleDemoCareTask,
  getDemoAppointments,
  saveDemoAppointment,
  getDemoMedications,
  saveDemoMedication,
} from '../demoStore';

// Care Tasks
export async function getCareTasks(userId: string): Promise<CareTask[]> {
  if (userId === 'demo_maya_uid') {
    return getDemoCareTasks();
  }
  const path = `users/${userId}/care_tasks`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'care_tasks'));
    const tasks = snap.docs.map(d => d.data() as CareTask);
    if (tasks.length > 0) return tasks;

    // Generate initial real user prenatal care tasks for their account
    const initialTasks: CareTask[] = [
      { id: `task_1_${userId}`, userId, title: 'Take prenatal vitamin with folic acid', category: 'medical', completed: false },
      { id: `task_2_${userId}`, userId, title: 'Drink at least 8 glasses of water (hydration)', category: 'hydration', completed: false },
      { id: `task_3_${userId}`, userId, title: '15-minute gentle maternal walk or stretch', category: 'movement', completed: false },
      { id: `task_4_${userId}`, userId, title: 'Nourishing fiber & protein rich snack', category: 'wellness', completed: false },
      { id: `task_5_${userId}`, userId, title: '10-minute side-lying rest & baby connection', category: 'mental', completed: false },
    ];
    for (const t of initialTasks) {
      await setDoc(doc(db, 'users', userId, 'care_tasks', t.id), sanitizeForFirestore(t));
    }
    return initialTasks;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveCareTask(task: CareTask): Promise<void> {
  if (task.userId === 'demo_maya_uid') {
    saveDemoCareTask(task);
    return;
  }
  const path = `users/${task.userId}/care_tasks/${task.id}`;
  try {
    const cleanData = sanitizeForFirestore(task);
    await setDoc(doc(db, 'users', task.userId, 'care_tasks', task.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function toggleCareTask(userId: string, taskId: string, completed: boolean): Promise<void> {
  if (userId === 'demo_maya_uid') {
    toggleDemoCareTask(taskId, completed);
    return;
  }
  const path = `users/${userId}/care_tasks/${taskId}`;
  try {
    const cleanData = sanitizeForFirestore({ completed });
    await updateDoc(doc(db, 'users', userId, 'care_tasks', taskId), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// Appointments
export async function getAppointments(userId: string): Promise<Appointment[]> {
  if (userId === 'demo_maya_uid') {
    return getDemoAppointments();
  }
  const path = `users/${userId}/appointments`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'appointments'));
    return snap.docs.map(d => d.data() as Appointment);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveAppointment(appointment: Appointment): Promise<void> {
  if (appointment.userId === 'demo_maya_uid') {
    saveDemoAppointment(appointment);
    return;
  }
  const path = `users/${appointment.userId}/appointments/${appointment.id}`;
  try {
    const cleanData = sanitizeForFirestore(appointment);
    await setDoc(doc(db, 'users', appointment.userId, 'appointments', appointment.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAppointment(userId: string, appointmentId: string): Promise<void> {
  if (userId === 'demo_maya_uid') {
    return;
  }
  const path = `users/${userId}/appointments/${appointmentId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'appointments', appointmentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Medications & Supplements
export async function getMedications(userId: string): Promise<Medication[]> {
  if (userId === 'demo_maya_uid') {
    return getDemoMedications();
  }
  const path = `users/${userId}/medications`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'medications'));
    return snap.docs.map(d => d.data() as Medication);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveMedication(med: Medication): Promise<void> {
  if (med.userId === 'demo_maya_uid') {
    saveDemoMedication(med);
    return;
  }
  const path = `users/${med.userId}/medications/${med.id}`;
  try {
    const cleanData = sanitizeForFirestore(med);
    await setDoc(doc(db, 'users', med.userId, 'medications', med.id), cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMedication(userId: string, medicationId: string): Promise<void> {
  if (userId === 'demo_maya_uid') {
    return;
  }
  const path = `users/${userId}/medications/${medicationId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'medications', medicationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
