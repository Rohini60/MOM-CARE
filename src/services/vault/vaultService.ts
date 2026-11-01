import {
  generateRandomSalt,
  deriveVerificationHash,
  deriveVaultAesKey,
  encryptText,
  decryptText,
  encryptArrayBuffer,
  decryptArrayBuffer,
} from './crypto';
import {
  saveEncryptedFileToIndexedDB,
  getEncryptedFileFromIndexedDB,
  deleteEncryptedFileFromIndexedDB,
  clearAllVaultFilesForUser,
} from './indexedDb';
import type {
  VaultMeta,
  VaultLockType,
  VaultFileRecord,
  TypedHealthData,
  HealthProfile,
  ExtractedHealthValue,
} from './types';

// In-Memory Key Session (Never written to storage/cookies/console)
let activeVaultAesKey: CryptoKey | null = null;
let activeHealthProfile: HealthProfile | null = null;
let lastUserActivityTime = Date.now();
let autoLockTimerId: any = null;
let wrongAttemptsCount = 0;
let lockoutUntilTimestamp = 0;

export interface UnlockResult {
  success: boolean;
  message?: string;
  lockoutRemainingSeconds?: number;
}

const INACTIVITY_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

export function isVaultCurrentlyUnlocked(): boolean {
  return activeVaultAesKey !== null;
}

export function getActiveVaultKey(): CryptoKey | null {
  return activeVaultAesKey;
}

export function getActiveHealthProfile(): HealthProfile | null {
  return activeHealthProfile;
}

export function updateActivityTimestamp(): void {
  lastUserActivityTime = Date.now();
}

/**
 * Starts inactivity timer that locks vault after 2 minutes of idle
 */
export function initAutoLockWatcher(onAutoLock: () => void): () => void {
  const checkActivity = () => {
    if (activeVaultAesKey && Date.now() - lastUserActivityTime >= INACTIVITY_TIMEOUT_MS) {
      lockVault();
      onAutoLock();
    }
  };

  const handleUserEvent = () => {
    lastUserActivityTime = Date.now();
  };

  window.addEventListener('mousemove', handleUserEvent, { passive: true });
  window.addEventListener('keydown', handleUserEvent, { passive: true });
  window.addEventListener('touchstart', handleUserEvent, { passive: true });
  window.addEventListener('click', handleUserEvent, { passive: true });

  autoLockTimerId = setInterval(checkActivity, 10000);

  return () => {
    clearInterval(autoLockTimerId);
    window.removeEventListener('mousemove', handleUserEvent);
    window.removeEventListener('keydown', handleUserEvent);
    window.removeEventListener('touchstart', handleUserEvent);
    window.removeEventListener('click', handleUserEvent);
  };
}

export function lockVault(): void {
  activeVaultAesKey = null;
  activeHealthProfile = null;
}

// Local storage key for Vault Meta (salt, iterations, verification hash, settings)
function getMetaStorageKey(userId: string): string {
  return `momcare_vault_meta_${userId}`;
}

function getDataStorageKey(userId: string): string {
  return `momcare_vault_data_${userId}`;
}

function getFilesListStorageKey(userId: string): string {
  return `momcare_vault_files_meta_${userId}`;
}

export function getVaultMeta(userId: string): VaultMeta | null {
  try {
    const raw = localStorage.getItem(getMetaStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function isVaultConfigured(userId: string): boolean {
  const meta = getVaultMeta(userId);
  return Boolean(meta?.isConfigured);
}

/**
 * Configure new lock for the first time
 */
export async function setupVaultLock(
  userId: string,
  lockType: VaultLockType,
  secret: string,
  consentGiven: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const saltHex = generateRandomSalt();
    const verificationHashHex = await deriveVerificationHash(secret, saltHex);
    const key = await deriveVaultAesKey(secret, saltHex);

    const meta: VaultMeta = {
      userId,
      isConfigured: true,
      lockType,
      saltHex,
      iterations: 210000,
      verificationHashHex,
      lockWholeApp: false,
      consentGiven,
      consentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastUnlockedAt: new Date().toISOString(),
    };

    localStorage.setItem(getMetaStorageKey(userId), JSON.stringify(meta));

    // Store in-memory session key
    activeVaultAesKey = key;
    lastUserActivityTime = Date.now();
    wrongAttemptsCount = 0;
    lockoutUntilTimestamp = 0;

    // Initialize empty typed data
    await saveTypedHealthData(userId, {
      updatedAt: new Date().toISOString(),
    });

    await refreshHealthProfile(userId);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Could not configure vault lock' };
  }
}

/**
 * Unlock Vault with user input (password, PIN, or pattern string)
 */
export async function unlockVault(userId: string, secret: string): Promise<UnlockResult> {
  const now = Date.now();
  if (now < lockoutUntilTimestamp) {
    const remaining = Math.ceil((lockoutUntilTimestamp - now) / 1000);
    return {
      success: false,
      lockoutRemainingSeconds: remaining,
      message: `For your security, please wait ${remaining} seconds before trying again.`,
    };
  }

  const meta = getVaultMeta(userId);
  if (!meta || !meta.isConfigured) {
    return { success: false, message: 'Health Vault is not set up yet.' };
  }

  try {
    const attemptHash = await deriveVerificationHash(secret, meta.saltHex);

    if (attemptHash === meta.verificationHashHex) {
      // Success! Reset wrong counter
      wrongAttemptsCount = 0;
      lockoutUntilTimestamp = 0;

      // Derive in-memory AES key
      activeVaultAesKey = await deriveVaultAesKey(secret, meta.saltHex);
      lastUserActivityTime = Date.now();

      meta.lastUnlockedAt = new Date().toISOString();
      localStorage.setItem(getMetaStorageKey(userId), JSON.stringify(meta));

      await refreshHealthProfile(userId);
      return { success: true };
    } else {
      wrongAttemptsCount++;
      if (wrongAttemptsCount >= 5) {
        // Lockout duration escalates: 30s for 5th, 60s for 6th, etc.
        const lockSeconds = 30 * Math.pow(2, wrongAttemptsCount - 5);
        lockoutUntilTimestamp = Date.now() + lockSeconds * 1000;
        return {
          success: false,
          lockoutRemainingSeconds: lockSeconds,
          message: `Too many attempts. Take a calm breath and try again in ${lockSeconds} seconds.`,
        };
      }
      return {
        success: false,
        message: 'The lock did not match. Please try gently again.',
      };
    }
  } catch (err) {
    return {
      success: false,
      message: 'Unable to verify lock. Please try again.',
    };
  }
}

/**
 * Change lock: requires verifying old secret first, then re-encrypting with new key
 */
export async function changeVaultLock(
  userId: string,
  oldSecret: string,
  newLockType: VaultLockType,
  newSecret: string
): Promise<{ success: boolean; message: string }> {
  const meta = getVaultMeta(userId);
  if (!meta) return { success: false, message: 'Vault not found.' };

  const oldHash = await deriveVerificationHash(oldSecret, meta.saltHex);
  if (oldHash !== meta.verificationHashHex) {
    return { success: false, message: 'The current lock was incorrect.' };
  }

  try {
    // Decrypt existing typed data and files using old key
    const oldKey = await deriveVaultAesKey(oldSecret, meta.saltHex);
    const existingTyped = await loadTypedHealthDataWithKey(userId, oldKey);
    const filesList = getVaultFilesList(userId);

    // Generate new salt and new key
    const newSaltHex = generateRandomSalt();
    const newVerificationHashHex = await deriveVerificationHash(newSecret, newSaltHex);
    const newKey = await deriveVaultAesKey(newSecret, newSaltHex);

    // Update meta
    meta.lockType = newLockType;
    meta.saltHex = newSaltHex;
    meta.verificationHashHex = newVerificationHashHex;
    meta.updatedAt = new Date().toISOString();
    localStorage.setItem(getMetaStorageKey(userId), JSON.stringify(meta));

    // Re-encrypt typed data with new key
    activeVaultAesKey = newKey;
    if (existingTyped) {
      await saveTypedHealthData(userId, existingTyped);
    }

    // Re-encrypt IndexedDB files
    for (const f of filesList) {
      const stored = await getEncryptedFileFromIndexedDB(f.id);
      if (stored) {
        const rawBuffer = await stored.encryptedBlob.arrayBuffer();
        const decrypted = await decryptArrayBuffer(oldKey, rawBuffer, stored.ivHex);
        const { encryptedBuffer, ivHex } = await encryptArrayBuffer(newKey, decrypted);
        await saveEncryptedFileToIndexedDB(
          f.id,
          userId,
          f.fileName,
          f.mimeType,
          ivHex,
          encryptedBuffer
        );
      }
    }

    await refreshHealthProfile(userId);
    return { success: true, message: 'Vault lock updated successfully.' };
  } catch (err) {
    return { success: false, message: 'Could not change lock. Data remains safe.' };
  }
}

/**
 * Forgot lock: Erases vault data and allows mother to start fresh
 */
export async function eraseVaultAndReset(userId: string): Promise<void> {
  lockVault();
  localStorage.removeItem(getMetaStorageKey(userId));
  localStorage.removeItem(getDataStorageKey(userId));
  localStorage.removeItem(getFilesListStorageKey(userId));
  await clearAllVaultFilesForUser(userId);
}

export function setLockWholeApp(userId: string, enabled: boolean): void {
  const meta = getVaultMeta(userId);
  if (meta) {
    meta.lockWholeApp = enabled;
    localStorage.setItem(getMetaStorageKey(userId), JSON.stringify(meta));
  }
}

export function isWholeAppLockEnabled(userId: string): boolean {
  const meta = getVaultMeta(userId);
  return Boolean(meta?.isConfigured && meta?.lockWholeApp);
}

/**
 * Typed Health Data Storage (Encrypted in transit and at rest)
 */
export async function saveTypedHealthData(userId: string, data: TypedHealthData): Promise<void> {
  if (!activeVaultAesKey) throw new Error('Vault is locked');

  const jsonStr = JSON.stringify(data);
  const { ciphertextBase64, ivHex } = await encryptText(activeVaultAesKey, jsonStr);

  const payload = {
    ivHex,
    ciphertext: ciphertextBase64,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(getDataStorageKey(userId), JSON.stringify(payload));
  await refreshHealthProfile(userId);
}

export async function getTypedHealthData(userId: string): Promise<TypedHealthData | null> {
  if (!activeVaultAesKey) return null;
  return loadTypedHealthDataWithKey(userId, activeVaultAesKey);
}

async function loadTypedHealthDataWithKey(
  userId: string,
  key: CryptoKey
): Promise<TypedHealthData | null> {
  try {
    const raw = localStorage.getItem(getDataStorageKey(userId));
    if (!raw) return null;
    const { ciphertext, ivHex } = JSON.parse(raw);
    const jsonStr = await decryptText(key, ciphertext, ivHex);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Vault File Records Management
 */
export function getVaultFilesList(userId: string): VaultFileRecord[] {
  try {
    const raw = localStorage.getItem(getFilesListStorageKey(userId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveVaultFilesList(userId: string, files: VaultFileRecord[]): void {
  localStorage.setItem(getFilesListStorageKey(userId), JSON.stringify(files));
}

export async function storeVaultFile(
  userId: string,
  file: File,
  category: VaultFileRecord['category'],
  tags: string[],
  reportDate: string,
  isTextReport: boolean,
  allowAiExtraction: boolean
): Promise<VaultFileRecord> {
  if (!activeVaultAesKey) throw new Error('Vault is locked');

  const fileId = `vf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const arrayBuffer = await file.arrayBuffer();

  const { encryptedBuffer, ivHex } = await encryptArrayBuffer(activeVaultAesKey, arrayBuffer);

  // Store in IndexedDB
  await saveEncryptedFileToIndexedDB(
    fileId,
    userId,
    file.name,
    file.type,
    ivHex,
    encryptedBuffer
  );

  const record: VaultFileRecord = {
    id: fileId,
    userId,
    fileName: file.name,
    category,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    reportDate: reportDate || new Date().toISOString().split('T')[0],
    tags,
    isTextReport,
    allowAiExtraction,
    encryptedIvHex: ivHex,
    isStoredLocally: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const list = getVaultFilesList(userId);
  list.unshift(record);
  saveVaultFilesList(userId, list);

  return record;
}

export async function retrieveAndDecryptFile(
  userId: string,
  fileId: string
): Promise<{ blob: Blob; fileName: string; mimeType: string }> {
  if (!activeVaultAesKey) throw new Error('Vault is locked');

  const stored = await getEncryptedFileFromIndexedDB(fileId);
  if (!stored) throw new Error('File not found in local vault');

  const encryptedBuffer = await stored.encryptedBlob.arrayBuffer();
  const decryptedBuffer = await decryptArrayBuffer(activeVaultAesKey, encryptedBuffer, stored.ivHex);
  const blob = new Blob([decryptedBuffer], { type: stored.mimeType });

  return { blob, fileName: stored.fileName, mimeType: stored.mimeType };
}

export async function deleteVaultFileItem(userId: string, fileId: string): Promise<void> {
  await deleteEncryptedFileFromIndexedDB(fileId);
  const list = getVaultFilesList(userId).filter((f) => f.id !== fileId);
  saveVaultFilesList(userId, list);
  await refreshHealthProfile(userId);
}

export async function renameVaultFileItem(
  userId: string,
  fileId: string,
  newName: string
): Promise<void> {
  const list = getVaultFilesList(userId).map((f) => (f.id === fileId ? { ...f, fileName: newName } : f));
  saveVaultFilesList(userId, list);
}

/**
 * Health Profile: Source of Truth compiled from confirmed vault data
 */
export async function refreshHealthProfile(userId: string): Promise<HealthProfile | null> {
  if (!activeVaultAesKey) {
    activeHealthProfile = null;
    return null;
  }

  const typed = await getTypedHealthData(userId);
  const files = getVaultFilesList(userId);
  const meta = getVaultMeta(userId);

  const now = new Date();
  const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);

  // Collect confirmed values from files and typed records
  let bp = typed?.bloodPressureSystolic && typed?.bloodPressureDiastolic ? {
    systolic: typed.bloodPressureSystolic,
    diastolic: typed.bloodPressureDiastolic,
    date: typed.bloodPressureDate || typed.updatedAt,
    isOld: typed.bloodPressureDate ? new Date(typed.bloodPressureDate) < threeWeeksAgo : false,
  } : undefined;

  let sugar = typed?.bloodSugarFasting || typed?.bloodSugarPostPrandial ? {
    fasting: typed.bloodSugarFasting,
    postPrandial: typed.bloodSugarPostPrandial,
    date: typed.bloodSugarDate || typed.updatedAt,
    isOld: typed.bloodSugarDate ? new Date(typed.bloodSugarDate) < threeWeeksAgo : false,
  } : undefined;

  let hb = typed?.hemoglobin ? {
    value: typed.hemoglobin,
    date: typed.hemoglobinDate || typed.updatedAt,
    isOld: typed.hemoglobinDate ? new Date(typed.hemoglobinDate) < threeWeeksAgo : false,
    isLow: typed.hemoglobin < 11.0,
  } : undefined;

  // Scan confirmed extracted values from text reports
  for (const f of files) {
    if (f.extractedValues) {
      for (const v of f.extractedValues) {
        const valNum = parseFloat(v.value);
        if (v.key === 'hemoglobin' && !isNaN(valNum) && !hb) {
          hb = {
            value: valNum,
            date: v.reportDate,
            isOld: new Date(v.reportDate) < threeWeeksAgo,
            isLow: valNum < 11.0,
          };
        } else if (v.key === 'blood_pressure' && !bp) {
          const parts = v.value.split('/');
          if (parts.length === 2) {
            bp = {
              systolic: parseInt(parts[0], 10),
              diastolic: parseInt(parts[1], 10),
              date: v.reportDate,
              isOld: new Date(v.reportDate) < threeWeeksAgo,
            };
          }
        }
      }
    }
  }

  // Calculate sections filled (out of 8)
  // 1. Blood group, 2. BP, 3. Sugar, 4. Hemoglobin, 5. Allergies, 6. Current Medicines, 7. Doctor restrictions, 8. Reports uploaded
  let filled = 0;
  if (typed?.bloodGroup) filled++;
  if (bp) filled++;
  if (sugar) filled++;
  if (hb) filled++;
  if (typed?.allergies && typed.allergies.length > 0) filled++;
  if (typed?.currentMedicines && typed.currentMedicines.length > 0) filled++;
  if (typed?.doctorRestrictions && typed.doctorRestrictions.length > 0) filled++;
  if (files.length > 0) filled++;

  const reminders: string[] = [];
  if (bp?.isOld) reminders.push(`Your last blood pressure was recorded on ${bp.date} (over 3 weeks ago).`);
  if (hb?.isOld) reminders.push(`Your last hemoglobin record was on ${hb.date}. Consider requesting an update.`);
  if (sugar?.isOld) reminders.push(`Your blood sugar test was recorded on ${sugar.date}.`);

  const confirmedConditions: string[] = [];
  if (hb?.isLow) confirmedConditions.push('Anemia / Low Hemoglobin');
  if (typed?.doctorRestrictions?.some((r) => r.toLowerCase().includes('bed rest'))) {
    confirmedConditions.push('Doctor Restricted: Bed Rest');
  }

  const profile: HealthProfile = {
    isVaultUnlocked: true,
    bloodGroup: typed?.bloodGroup,
    heightCm: typed?.heightCm,
    weightKg: typed?.weightKg,
    latestBP: bp,
    latestSugar: sugar,
    latestHemoglobin: hb,
    allergies: typed?.allergies || [],
    medicines: typed?.currentMedicines || [],
    doctorRestrictions: typed?.doctorRestrictions || [],
    pastSurgeries: typed?.pastSurgeries || [],
    previousPregnancies: typed?.previousPregnancies,
    confirmedConditions,
    sectionsFilledCount: filled,
    totalSectionsCount: 8,
    completenessPercentage: Math.round((filled / 8) * 100),
    oldValueReminders: reminders,
    lastUnlockedTime: meta?.lastUnlockedAt,
  };

  activeHealthProfile = profile;
  return profile;
}

/**
 * Download all vault data as an exportable bundle
 */
export async function downloadAllVaultData(userId: string): Promise<void> {
  if (!activeVaultAesKey) throw new Error('Vault is locked');

  const typed = await getTypedHealthData(userId);
  const filesList = getVaultFilesList(userId);
  const meta = getVaultMeta(userId);

  const exportObj = {
    exportedAt: new Date().toISOString(),
    vaultMeta: {
      lockType: meta?.lockType,
      createdAt: meta?.createdAt,
      lastUnlockedAt: meta?.lastUnlockedAt,
    },
    healthProfile: activeHealthProfile,
    typedHealthData: typed,
    storedFilesMetadata: filesList,
    notice: 'Prototype export of encrypted health vault structure.',
  };

  const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `MomCare_Health_Vault_Export_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
