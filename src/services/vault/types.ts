export type VaultLockType = 'password' | 'pin' | 'pattern';

export interface VaultMeta {
  userId: string;
  isConfigured: boolean;
  lockType: VaultLockType;
  saltHex: string; // Random 16-byte salt per user
  iterations: number; // PBKDF2 iterations (>= 200,000)
  verificationHashHex: string; // Salted hash for verification (never plain text)
  lockWholeApp: boolean;
  consentGiven: boolean;
  consentDate?: string;
  createdAt: string;
  updatedAt: string;
  lastUnlockedAt?: string;
}

export type VaultItemCategory =
  | 'lab_report'
  | 'ultrasound'
  | 'prescription'
  | 'discharge_summary'
  | 'vaccination'
  | 'xray_scan'
  | 'photo'
  | 'typed_record';

export interface ExtractedHealthValue {
  key: string;
  labelEn: string;
  labelTa: string;
  labelHi: string;
  value: string;
  unit?: string;
  referenceRange?: string;
  isNormal?: boolean;
  isWarning?: boolean;
  sourceFile: string;
  reportDate: string;
}

export interface VaultFileRecord {
  id: string;
  userId: string;
  fileName: string;
  category: VaultItemCategory;
  mimeType: string;
  fileSize: number;
  reportDate: string;
  tags: string[];
  notes?: string;
  isTextReport: boolean;
  allowAiExtraction: boolean;
  extractedValues?: ExtractedHealthValue[];
  encryptedIvHex: string;
  isStoredLocally: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypedHealthData {
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bloodPressureDate?: string;
  bloodSugarFasting?: number;
  bloodSugarPostPrandial?: number;
  bloodSugarDate?: string;
  hemoglobin?: number;
  hemoglobinDate?: string;
  allergies?: string[];
  currentMedicines?: Array<{
    name: string;
    dosage?: string;
    timing?: string;
    prescribedBy?: string;
  }>;
  pastSurgeries?: string[];
  previousPregnancies?: string;
  doctorRestrictions?: string[]; // e.g. "bed rest", "no heavy lifting", "pelvic rest"
  appointmentDates?: string[];
  updatedAt: string;
}

export interface HealthProfile {
  isVaultUnlocked: boolean;
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  latestBP?: { systolic: number; diastolic: number; date: string; isOld: boolean };
  latestSugar?: { fasting?: number; postPrandial?: number; date: string; isOld: boolean };
  latestHemoglobin?: { value: number; date: string; isOld: boolean; isLow: boolean };
  latestAFI?: { value: number; date: string }; // Amniotic Fluid Index
  latestEFW?: { value: number; date: string }; // Estimated Fetal Weight in grams
  allergies: string[];
  medicines: Array<{ name: string; dosage?: string }>;
  doctorRestrictions: string[]; // e.g. "bed rest"
  pastSurgeries: string[];
  previousPregnancies?: string;
  confirmedConditions: string[]; // only written in reports or typed by her
  sectionsFilledCount: number;
  totalSectionsCount: number;
  completenessPercentage: number;
  oldValueReminders: string[];
  lastUnlockedTime?: string;
}
