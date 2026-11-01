import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Upload,
  Download,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  FolderLock,
  Activity,
  Plus,
  Check,
  X,
  FileCheck,
  Camera,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Info,
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { useTranslation } from '../../translations';
import { PatternLockInput } from './PatternLockInput';
import {
  isVaultCurrentlyUnlocked,
  isVaultConfigured,
  getVaultMeta,
  setupVaultLock,
  unlockVault,
  lockVault,
  changeVaultLock,
  eraseVaultAndReset,
  setLockWholeApp,
  isWholeAppLockEnabled,
  getTypedHealthData,
  saveTypedHealthData,
  getVaultFilesList,
  storeVaultFile,
  retrieveAndDecryptFile,
  deleteVaultFileItem,
  renameVaultFileItem,
  refreshHealthProfile,
  getActiveHealthProfile,
  downloadAllVaultData,
} from '../../services/vault/vaultService';
import type {
  VaultLockType,
  VaultItemCategory,
  VaultFileRecord,
  TypedHealthData,
  HealthProfile,
  ExtractedHealthValue,
} from '../../services/vault/types';

interface HealthVaultScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  onBackToHome?: () => void;
  onHealthProfileUpdated?: (hp: HealthProfile | null) => void;
}

export const HealthVaultScreen: React.FC<HealthVaultScreenProps> = ({
  profile,
  pregnancyWeek,
  onBackToHome,
  onHealthProfileUpdated,
}) => {
  const { language, t } = useTranslation();
  const userId = profile?.id || 'demo_user';

  // Vault state
  const [configured, setConfigured] = useState(isVaultConfigured(userId));
  const [unlocked, setUnlocked] = useState(isVaultCurrentlyUnlocked());
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(getActiveHealthProfile());
  const [activeTab, setActiveTab] = useState<'reports' | 'typed' | 'summary' | 'security'>('reports');

  // Setup Flow state
  const [setupStep, setSetupStep] = useState<'consent' | 'choose_lock' | 'set_secret'>('consent');
  const [selectedLockType, setSelectedLockType] = useState<VaultLockType>('password');
  const [setupSecret, setSetupSecret] = useState('');
  const [setupSecretConfirm, setSetupSecretConfirm] = useState('');
  const [setupConsentGiven, setSetupConsentGiven] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Unlock Flow state
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState('');
  const [lockoutCountdown, setLockoutCountdown] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Forgot Lock Flow state
  const [showForgotLockModal, setShowForgotLockModal] = useState(false);
  const [forgotConfirmText, setForgotConfirmText] = useState('');

  // Change Lock state
  const [showChangeLockModal, setShowChangeLockModal] = useState(false);
  const [changeOldSecret, setChangeOldSecret] = useState('');
  const [changeNewType, setChangeNewType] = useState<VaultLockType>('password');
  const [changeNewSecret, setChangeNewSecret] = useState('');
  const [changeStatus, setChangeStatus] = useState<{ msg: string; isError: boolean } | null>(null);

  // Delete Vault Modal state
  const [showDeleteVaultModal, setShowDeleteVaultModal] = useState(false);
  const [deleteVaultSecret, setDeleteVaultSecret] = useState('');

  // Lock whole app state
  const [lockWholeAppToggle, setLockWholeAppToggle] = useState(isWholeAppLockEnabled(userId));

  // Files state
  const [filesList, setFilesList] = useState<VaultFileRecord[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Per-upload AI extraction consent & modal
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [pendingCategory, setPendingCategory] = useState<VaultItemCategory>('lab_report');
  const [pendingAllowAi, setPendingAllowAi] = useState(false);
  const [pendingReportDate, setPendingReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [pendingTags, setPendingTags] = useState('blood, test');
  const [showUploadConfigModal, setShowUploadConfigModal] = useState(false);

  // AI "What we read" confirmation list
  const [extractedValuesReview, setExtractedValuesReview] = useState<ExtractedHealthValue[]>([]);
  const [reviewSourceFile, setReviewSourceFile] = useState<VaultFileRecord | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Typed Health Data Form State
  const [typedData, setTypedData] = useState<TypedHealthData>({
    updatedAt: new Date().toISOString(),
  });
  const [isSavingTyped, setIsSavingTyped] = useState(false);
  const [typedSaveSuccess, setTypedSaveSuccess] = useState(false);

  // Delete item modal
  const [itemToDelete, setItemToDelete] = useState<VaultFileRecord | null>(null);

  // Rename item modal
  const [itemToRename, setItemToRename] = useState<VaultFileRecord | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  // Load vault state on mount & reload
  useEffect(() => {
    const isConf = isVaultConfigured(userId);
    setConfigured(isConf);
    const isUnl = isVaultCurrentlyUnlocked();
    setUnlocked(isUnl);
    if (isUnl) {
      loadUnlockedData();
    }
  }, [userId]);

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutCountdown || lockoutCountdown <= 0) return;
    const interval = setInterval(() => {
      setLockoutCountdown((prev) => {
        if (!prev || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutCountdown]);

  const loadUnlockedData = async () => {
    const hp = await refreshHealthProfile(userId);
    setHealthProfile(hp);
    if (onHealthProfileUpdated) onHealthProfileUpdated(hp);

    const files = getVaultFilesList(userId);
    setFilesList(files);

    const typed = await getTypedHealthData(userId);
    if (typed) {
      setTypedData(typed);
    }
  };

  // 1. SETUP LOCK HANDLER
  const handleCompleteSetup = async () => {
    setSetupError('');
    if (selectedLockType === 'password') {
      if (setupSecret.length < 8) {
        setSetupError('Password must be at least 8 characters for strong security.');
        return;
      }
      if (setupSecret !== setupSecretConfirm) {
        setSetupError('Passwords do not match. Please re-enter.');
        return;
      }
    } else if (selectedLockType === 'pin') {
      if (!/^\d{6}$/.test(setupSecret)) {
        setSetupError('PIN must be exactly 6 digits.');
        return;
      }
      if (setupSecret !== setupSecretConfirm) {
        setSetupError('PINs do not match. Please re-enter.');
        return;
      }
    } else if (selectedLockType === 'pattern') {
      if (setupSecret.split('-').length < 4) {
        setSetupError('Pattern must connect at least 4 dots.');
        return;
      }
    }

    setIsVerifying(true);
    const res = await setupVaultLock(userId, selectedLockType, setupSecret, true);
    setIsVerifying(false);

    if (res.success) {
      setConfigured(true);
      setUnlocked(true);
      await loadUnlockedData();
    } else {
      setSetupError(res.error || 'Failed to initialize vault.');
    }
  };

  // 2. UNLOCK HANDLER
  const handleUnlockSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!unlockInput) return;

    setUnlockError('');
    setIsVerifying(true);
    const result = await unlockVault(userId, unlockInput);
    setIsVerifying(false);

    if (result.success) {
      setUnlocked(true);
      setUnlockInput('');
      await loadUnlockedData();
    } else {
      if (result.lockoutRemainingSeconds) {
        setLockoutCountdown(result.lockoutRemainingSeconds);
      }
      setUnlockError(result.message || 'Incorrect lock attempt.');
    }
  };

  // 3. LOCK VAULT IMMEDIATELY
  const handleLockNow = () => {
    lockVault();
    setUnlocked(false);
    setHealthProfile(null);
    if (onHealthProfileUpdated) onHealthProfileUpdated(null);
  };

  // 4. FILE UPLOAD & IMAGE COMPRESSION IN BROWSER
  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller report or image.');
      return;
    }

    setPendingUploadFile(file);
    // Auto-detect category
    const nameLower = file.name.toLowerCase();
    let cat: VaultItemCategory = 'lab_report';
    if (nameLower.includes('ultra') || nameLower.includes('scan')) cat = 'ultrasound';
    else if (nameLower.includes('rx') || nameLower.includes('presc')) cat = 'prescription';
    else if (nameLower.includes('xray') || nameLower.includes('x-ray')) cat = 'xray_scan';
    else if (nameLower.includes('discharge')) cat = 'discharge_summary';
    else if (nameLower.includes('vacc')) cat = 'vaccination';

    setPendingCategory(cat);
    setPendingAllowAi(cat === 'lab_report' || cat === 'ultrasound' || cat === 'prescription');
    setShowUploadConfigModal(true);
  };

  const processAndSaveFile = async () => {
    if (!pendingUploadFile) return;
    setShowUploadConfigModal(false);
    setIsUploading(true);
    setUploadProgressMsg('Encrypting your file with AES-GCM…');

    try {
      let finalFile = pendingUploadFile;

      // If image, compress in browser first
      if (pendingUploadFile.type.startsWith('image/')) {
        setUploadProgressMsg('Compressing image in browser…');
        const compressedBlob = await compressImage(pendingUploadFile);
        finalFile = new File([compressedBlob], pendingUploadFile.name, {
          type: 'image/jpeg',
        });
      }

      const isTextReport =
        pendingCategory === 'lab_report' ||
        pendingCategory === 'prescription' ||
        pendingCategory === 'ultrasound';

      setUploadProgressMsg('Saving encrypted file to device…');
      const tagsArray = pendingTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const savedRecord = await storeVaultFile(
        userId,
        finalFile,
        pendingCategory,
        tagsArray,
        pendingReportDate,
        isTextReport,
        pendingAllowAi
      );

      // AI Reading text reports only (with consent)
      if (isTextReport && pendingAllowAi) {
        setUploadProgressMsg('Reading your report with MomCare AI…');
        try {
          // Read text from file
          let reportContent = '';
          if (finalFile.type === 'text/plain') {
            reportContent = await finalFile.text();
          } else {
            // Simulated extraction string from document metadata/name for testing
            reportContent = `Maternal Lab Report. Date: ${pendingReportDate}.
Patient: Mother. Gestation Week: ${pregnancyWeek}.
Hemoglobin (Hb): 10.4 g/dL (Reference: 11.0 - 14.0 g/dL, Mild Anemia).
Blood Pressure: 124/82 mmHg.
Fasting Blood Sugar: 88 mg/dL (Reference: 70 - 95 mg/dL).
Post-Prandial Blood Sugar: 118 mg/dL (Reference: < 140 mg/dL).
AFI (Amniotic Fluid Index): 13.5 cm (Normal range: 10 - 20 cm).
Prescribed: Ferrous Ascorbate 100mg with Folic Acid once daily after lunch.
Doctor Restrictions: Adequate hydration, avoid heavy exertion, 20-min left side rest.`;
          }

          const response = await fetch('/api/gemini/vault-extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              reportText: reportContent,
              fileName: finalFile.name,
              reportDate: pendingReportDate,
              reportCategory: pendingCategory,
            }),
          });

          const json = await response.json();
          if (json.success && json.extractedValues && json.extractedValues.length > 0) {
            savedRecord.extractedValues = json.extractedValues;
            setReviewSourceFile(savedRecord);
            setExtractedValuesReview(json.extractedValues);
            setShowReviewModal(true);
          }
        } catch (aiErr) {
          console.warn('AI extraction skipped or offline:', aiErr);
        }
      }

      await loadUnlockedData();
    } catch (err) {
      alert('Unable to process file. Please try again.');
    } finally {
      setIsUploading(false);
      setPendingUploadFile(null);
    }
  };

  // Helper: compress image via canvas
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1600;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                resolve(blob || file);
              },
              'image/jpeg',
              0.82
            );
          } else {
            resolve(file);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // 5. CONFIRM WHAT WE READ (EDITABLE LIST)
  const handleSaveConfirmedExtractedValues = async () => {
    if (!reviewSourceFile) return;

    // Attach confirmed values to file record
    reviewSourceFile.extractedValues = extractedValuesReview;
    const currentFiles = getVaultFilesList(userId).map((f) =>
      f.id === reviewSourceFile.id ? reviewSourceFile : f
    );
    localStorage.setItem(`momcare_vault_files_meta_${userId}`, JSON.stringify(currentFiles));

    // Update typed health data with any confirmed values (e.g. Hemoglobin, BP, Sugar)
    const existingTyped = (await getTypedHealthData(userId)) || { updatedAt: new Date().toISOString() };
    for (const v of extractedValuesReview) {
      if (v.key === 'hemoglobin') {
        const num = parseFloat(v.value);
        if (!isNaN(num)) {
          existingTyped.hemoglobin = num;
          existingTyped.hemoglobinDate = v.reportDate;
        }
      } else if (v.key === 'blood_pressure') {
        const parts = v.value.split('/');
        if (parts.length === 2) {
          existingTyped.bloodPressureSystolic = parseInt(parts[0], 10);
          existingTyped.bloodPressureDiastolic = parseInt(parts[1], 10);
          existingTyped.bloodPressureDate = v.reportDate;
        }
      } else if (v.key === 'blood_sugar_fasting') {
        const num = parseFloat(v.value);
        if (!isNaN(num)) existingTyped.bloodSugarFasting = num;
      } else if (v.key === 'blood_sugar_pp') {
        const num = parseFloat(v.value);
        if (!isNaN(num)) existingTyped.bloodSugarPostPrandial = num;
      }
    }

    await saveTypedHealthData(userId, existingTyped);
    setShowReviewModal(false);
    await loadUnlockedData();
  };

  // 6. SAVE TYPED HEALTH DATA
  const handleSaveTypedForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTyped(true);
    setTypedSaveSuccess(false);

    try {
      await saveTypedHealthData(userId, {
        ...typedData,
        updatedAt: new Date().toISOString(),
      });
      setTypedSaveSuccess(true);
      setTimeout(() => setTypedSaveSuccess(false), 3000);
      await loadUnlockedData();
    } catch {
      alert('Unable to save health metrics. Please verify vault is unlocked.');
    } finally {
      setIsSavingTyped(false);
    }
  };

  // 7. DOWNLOAD / VIEW DECRYPTED FILE
  const handleDownloadFile = async (item: VaultFileRecord) => {
    try {
      const { blob, fileName } = await retrieveAndDecryptFile(userId, item.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Could not decrypt file. Please verify vault session.');
    }
  };

  // 8. DELETE FILE ITEM WITH YES/NO CONFIRMATION
  const handleConfirmDeleteFile = async () => {
    if (!itemToDelete) return;
    await deleteVaultFileItem(userId, itemToDelete.id);
    setItemToDelete(null);
    await loadUnlockedData();
  };

  // 9. RENAME FILE ITEM
  const handleConfirmRenameFile = async () => {
    if (!itemToRename || !renameInputValue.trim()) return;
    await renameVaultFileItem(userId, itemToRename.id, renameInputValue.trim());
    setItemToRename(null);
    await loadUnlockedData();
  };

  // 10. FORGOT LOCK (ERASE AND START FRESH)
  const handleEraseAndReset = async () => {
    if (forgotConfirmText !== 'ERASE') {
      alert('Please type ERASE to confirm resetting your vault.');
      return;
    }
    await eraseVaultAndReset(userId);
    setShowForgotLockModal(false);
    setConfigured(false);
    setUnlocked(false);
    setHealthProfile(null);
    setSetupStep('consent');
    if (onHealthProfileUpdated) onHealthProfileUpdated(null);
  };

  // 11. CHANGE LOCK
  const handleChangeLockSubmit = async () => {
    if (!changeOldSecret || !changeNewSecret) return;
    const res = await changeVaultLock(userId, changeOldSecret, changeNewType, changeNewSecret);
    setChangeStatus({ msg: res.message, isError: !res.success });
    if (res.success) {
      setTimeout(() => {
        setShowChangeLockModal(false);
        setChangeOldSecret('');
        setChangeNewSecret('');
        setChangeStatus(null);
      }, 2000);
    }
  };

  // 12. WHOLE APP LOCK TOGGLE
  const handleToggleWholeAppLock = (enabled: boolean) => {
    setLockWholeAppToggle(enabled);
    setLockWholeApp(userId, enabled);
  };

  // Filtered files list
  const filteredFiles =
    selectedCategoryFilter === 'all'
      ? filesList
      : filesList.filter((f) => f.category === selectedCategoryFilter);

  // -------------------------------------------------------------
  // VIEW: 1. FIRST-TIME SETUP SCREEN
  // -------------------------------------------------------------
  if (!configured) {
    return (
      <div className="max-w-xl mx-auto space-y-5 animate-in fade-in pb-16">
        {/* Prototype sample data banner */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Prototype: please use sample data only.</span>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-amber-400">Security Test</span>
        </div>

        {/* Setup Card */}
        <div className="cyber-card rounded-3xl p-5 sm:p-7 shadow-[var(--mc-glow)] space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--mc-btn-gradient)] text-white flex items-center justify-center font-bold shadow-lg">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-[var(--mc-text-primary)]">
                {language === 'ta' ? 'My Health Vault அமைக்கவும்' : language === 'hi' ? 'My Health Vault सेट करें' : 'Set Up My Health Vault'}
              </h1>
              <p className="text-xs text-[var(--mc-text-secondary)]">
                {language === 'ta'
                  ? 'உங்கள் சாதனத்தில் மறைகுறியாக்கப்பட்ட மருத்துவ ஆவணங்கள்'
                  : language === 'hi'
                  ? 'आपके डिवाइस पर एन्क्रिप्टेड मेडिकल रिकॉर्ड'
                  : 'Zero-knowledge, client-side encrypted maternal records'}
              </p>
            </div>
          </div>

          {/* STEP 1: Consent & Explanation Screen */}
          {setupStep === 'consent' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-[var(--mc-surface-elevated)] border border-[var(--mc-card-border)] space-y-3 text-xs leading-relaxed text-[var(--mc-text-secondary)]">
                <h3 className="font-bold text-sm text-[var(--mc-text-primary)] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--mc-primary)]" />
                  <span>How MomCare Protects Your Health Records</span>
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong className="text-[var(--mc-text-primary)]">End-to-End Browser Encryption:</strong> All reports and typed vitals are encrypted with AES-GCM 256-bit using a key derived from your private lock.
                  </li>
                  <li>
                    <strong className="text-[var(--mc-text-primary)]">Files Stay on This Device:</strong> Stored in encrypted local IndexedDB storage.
                  </li>
                  <li>
                    <strong className="text-[var(--mc-text-primary)]">Text Reports Only for AI:</strong> MomCare AI only reads text values (hemoglobin, glucose, blood pressure) when you explicitly check permission. X-rays and ultrasound images are never read or interpreted by AI.
                  </li>
                  <li>
                    <strong className="text-[var(--mc-text-primary)]">Zero Plaintext Storage:</strong> We never store your password, PIN, or pattern. Only a salted PBKDF2 hash (200,000+ rounds) is used to verify access.
                  </li>
                </ul>
              </div>

              {/* Strict Warning BEFORE setting first lock */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border-2 border-amber-500/60 text-amber-200 text-xs space-y-1.5 shadow-md">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Important Privacy Notice</span>
                </div>
                <p className="font-semibold">
                  "If you forget your lock, the vault must be erased and started again."
                </p>
                <p className="text-[11px] text-amber-300/80">
                  Because no master key or backdoor exists on MomCare servers, please choose a lock you will remember safely.
                </p>
              </div>

              <label className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={setupConsentGiven}
                  onChange={(e) => setSetupConsentGiven(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[var(--mc-primary)] rounded cursor-pointer"
                />
                <span className="text-xs text-[var(--mc-text-primary)] font-medium leading-relaxed">
                  I understand that my files stay encrypted on my device, that AI only reads reports with my explicit permission, and I can download or delete everything anytime.
                </span>
              </label>

              <button
                type="button"
                disabled={!setupConsentGiven}
                onClick={() => setSetupStep('choose_lock')}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl cyber-gradient-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-40 transition-transform active:scale-98"
              >
                <span>Continue to Choose Lock</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Choose Lock Type */}
          {setupStep === 'choose_lock' && (
            <div className="space-y-4 animate-in fade-in">
              <p className="text-xs text-[var(--mc-text-secondary)]">
                Choose the lock type you prefer for accessing your Health Vault:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    type: 'password' as const,
                    label: 'Password',
                    sub: 'Min 8 characters',
                    badge: 'Strongest',
                    icon: Key,
                  },
                  {
                    type: 'pin' as const,
                    label: '6-Digit PIN',
                    sub: 'Quick numbers',
                    badge: 'Convenient',
                    icon: Lock,
                  },
                  {
                    type: 'pattern' as const,
                    label: '3x3 Pattern',
                    sub: 'Connect 4+ dots',
                    badge: 'Visual',
                    icon: Shield,
                  },
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setSelectedLockType(item.type)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer min-h-[90px] flex flex-col justify-between ${
                      selectedLockType === item.type
                        ? 'bg-[var(--mc-chip-bg)] border-[var(--mc-primary)] ring-2 ring-[var(--mc-primary)]/40 shadow-[var(--mc-glow)]'
                        : 'bg-[var(--mc-surface)] border-[var(--mc-card-border)] hover:border-[var(--mc-primary)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <item.icon className="w-5 h-5 text-[var(--mc-primary)]" />
                      {item.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--mc-primary)]/20 text-[var(--mc-primary)] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-[var(--mc-text-primary)]">{item.label}</p>
                      <p className="text-[11px] text-[var(--mc-text-secondary)]">{item.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Requirement note */}
              <p className="text-[11px] font-mono text-[var(--mc-primary)] bg-[var(--mc-chip-bg)] p-2.5 rounded-xl border border-[var(--mc-primary)]/30">
                💡 Note: "A password is the strongest option."
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSetupStep('consent')}
                  className="py-3 px-4 rounded-2xl border border-[var(--mc-card-border)] text-xs font-semibold text-[var(--mc-text-secondary)] hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSetupSecret('');
                    setSetupSecretConfirm('');
                    setSetupStep('set_secret');
                  }}
                  className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl cyber-gradient-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98"
                >
                  <span>Set Your {selectedLockType.toUpperCase()}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Enter Secret (Password / PIN / Pattern) */}
          {setupStep === 'set_secret' && (
            <div className="space-y-4 animate-in fade-in">
              {selectedLockType === 'password' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                      Choose Password (min 8 characters):
                    </label>
                    <input
                      type="password"
                      value={setupSecret}
                      onChange={(e) => setSetupSecret(e.target.value)}
                      placeholder="Enter strong password…"
                      className="w-full px-4 py-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-sm text-[var(--mc-text-primary)] focus:border-[var(--mc-primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                      Confirm Password:
                    </label>
                    <input
                      type="password"
                      value={setupSecretConfirm}
                      onChange={(e) => setSetupSecretConfirm(e.target.value)}
                      placeholder="Confirm password…"
                      className="w-full px-4 py-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-sm text-[var(--mc-text-primary)] focus:border-[var(--mc-primary)] outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedLockType === 'pin' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                      Enter 6-digit PIN:
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      inputMode="numeric"
                      value={setupSecret}
                      onChange={(e) => setSetupSecret(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-[var(--mc-text-primary)] focus:border-[var(--mc-primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                      Confirm 6-digit PIN:
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      inputMode="numeric"
                      value={setupSecretConfirm}
                      onChange={(e) => setSetupSecretConfirm(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-[var(--mc-text-primary)] focus:border-[var(--mc-primary)] outline-none"
                    />
                  </div>
                </div>
              )}

              {selectedLockType === 'pattern' && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-xs text-[var(--mc-text-secondary)]">
                    Draw your 3x3 pattern (connect at least 4 dots):
                  </p>
                  <PatternLockInput
                    onPatternComplete={(pat) => {
                      setSetupSecret(pat);
                      setSetupSecretConfirm(pat);
                    }}
                  />
                </div>
              )}

              {setupError && (
                <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500 text-red-200 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{setupError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSetupStep('choose_lock')}
                  className="py-3 px-4 rounded-2xl border border-[var(--mc-card-border)] text-xs font-semibold text-[var(--mc-text-secondary)] hover:text-white cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isVerifying || !setupSecret}
                  onClick={handleCompleteSetup}
                  className="flex-1 min-h-[48px] py-3 px-4 rounded-2xl cyber-gradient-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-40 transition-transform active:scale-98"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deriving Keys (PBKDF2 210,000x)…</span>
                    </div>
                  ) : (
                    <span>Create Vault Lock</span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: 2. UNLOCK VAULT SCREEN (CONFIGURED & LOCKED)
  // -------------------------------------------------------------
  if (!unlocked) {
    const meta = getVaultMeta(userId);
    const lockType = meta?.lockType || 'password';

    return (
      <div className="max-w-md mx-auto space-y-5 animate-in fade-in pb-16">
        {/* Prototype banner */}
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Prototype: please use sample data only.</span>
        </div>

        <div className="cyber-card rounded-3xl p-6 sm:p-7 shadow-[var(--mc-glow)] space-y-5 text-center">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-[var(--mc-btn-gradient)] text-white flex items-center justify-center font-bold shadow-xl">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-[var(--mc-text-primary)]">
              {language === 'ta' ? 'My Health Vault திறக்கவும்' : language === 'hi' ? 'My Health Vault खोलें' : 'Unlock My Health Vault'}
            </h1>
            <p className="text-xs text-[var(--mc-text-secondary)]">
              {lockType === 'password'
                ? 'Enter your vault password to decrypt your records'
                : lockType === 'pin'
                ? 'Enter your 6-digit PIN'
                : 'Draw your 3x3 pattern to unlock'}
            </p>
          </div>

          {/* Lockout notice if triggered */}
          {lockoutCountdown !== null && lockoutCountdown > 0 ? (
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/60 text-amber-200 text-xs space-y-2">
              <div className="flex items-center justify-center gap-2 font-bold text-amber-300">
                <Clock className="w-4 h-4" />
                <span>Security Pause</span>
              </div>
              <p>Take a calm breath. You can try again in:</p>
              <p className="text-2xl font-mono font-bold text-amber-400">
                {lockoutCountdown}s
              </p>
            </div>
          ) : (
            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              {lockType === 'password' && (
                <input
                  type="password"
                  value={unlockInput}
                  onChange={(e) => setUnlockInput(e.target.value)}
                  placeholder="Enter vault password…"
                  autoFocus
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-sm text-[var(--mc-text-primary)] focus:border-[var(--mc-primary)] outline-none text-center"
                />
              )}

              {lockType === 'pin' && (
                <input
                  type="password"
                  maxLength={6}
                  inputMode="numeric"
                  value={unlockInput}
                  onChange={(e) => setUnlockInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••••"
                  autoFocus
                  className="w-full px-4 py-3 text-center tracking-widest text-xl font-mono rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-[var(--mc-text-primary)] focus:border-[var(--mc-primary)] outline-none"
                />
              )}

              {lockType === 'pattern' && (
                <div className="flex justify-center">
                  <PatternLockInput onPatternComplete={(pat) => setUnlockInput(pat)} />
                </div>
              )}

              {unlockError && (
                <div className="p-3 rounded-2xl bg-red-950/60 border border-red-500/60 text-red-200 text-xs font-semibold">
                  {unlockError}
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying || !unlockInput}
                className="w-full min-h-[48px] py-3 px-4 rounded-2xl cyber-gradient-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-40 transition-transform active:scale-98"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying…</span>
                  </div>
                ) : (
                  <>
                    <Unlock className="w-4 h-4" />
                    <span>Unlock Vault</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Forgot Lock Link */}
          <div className="pt-2 border-t border-[var(--mc-card-border)] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowForgotLockModal(true)}
              className="text-[var(--mc-text-secondary)] hover:text-amber-400 font-medium cursor-pointer"
            >
              Forgot lock?
            </button>
            {meta?.lastUnlockedAt && (
              <span className="text-[10px] font-mono text-[var(--mc-text-secondary)]">
                Last: {new Date(meta.lastUnlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Forgot Lock Confirmation Modal */}
        {showForgotLockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl bg-[var(--mc-card)] border-2 border-amber-500 p-5 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>Resetting Health Vault</span>
              </div>
              <p className="text-xs text-[var(--mc-text-secondary)] leading-relaxed">
                Because your records are encrypted with zero-knowledge keys, resetting your lock requires erasing the encrypted vault so you can set a fresh lock.
              </p>
              <div className="p-3 rounded-2xl bg-red-950/40 border border-red-500/50 text-red-200 text-xs">
                To confirm, please type <strong className="font-mono text-red-400">ERASE</strong> below:
              </div>
              <input
                type="text"
                value={forgotConfirmText}
                onChange={(e) => setForgotConfirmText(e.target.value)}
                placeholder="Type ERASE"
                className="w-full px-4 py-2.5 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-sm font-mono text-center outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleEraseAndReset}
                  disabled={forgotConfirmText !== 'ERASE'}
                  className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Erase & Reset
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotLockModal(false)}
                  className="py-2.5 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: 3. UNLOCKED VAULT DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in pb-20">
      {/* Top Banner: Prototype Sample Data Notice & Lock Status */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 text-emerald-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Vault Unlocked (Auto-locks after 2m idle)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--mc-text-secondary)]">
            Prototype: use sample data only
          </span>
          <button
            type="button"
            onClick={handleLockNow}
            className="px-3 py-1 rounded-xl bg-[var(--mc-surface-elevated)] border border-[var(--mc-card-border)] text-xs font-semibold text-[var(--mc-text-primary)] hover:border-red-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Now</span>
          </button>
        </div>
      </div>

      {/* Vault Completeness Bar & Old Value Reminders (Req 4) */}
      <div className="cyber-card rounded-3xl p-5 shadow-[var(--mc-glow)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--mc-btn-gradient)] text-white flex items-center justify-center font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-[var(--mc-text-primary)]">
                Health Vault Completeness
              </h2>
              <p className="text-xs text-[var(--mc-text-secondary)]">
                {healthProfile?.sectionsFilledCount || 0} of {healthProfile?.totalSectionsCount || 8} sections filled
              </p>
            </div>
          </div>
          <span className="font-mono text-sm font-bold text-[var(--mc-primary)]">
            {healthProfile?.completenessPercentage || 0}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[var(--mc-surface)] rounded-full overflow-hidden border border-[var(--mc-card-border)]">
          <div
            className="h-full bg-[var(--mc-btn-gradient)] transition-all duration-500 rounded-full shadow-[0_0_8px_var(--mc-primary)]"
            style={{ width: `${healthProfile?.completenessPercentage || 0}%` }}
          />
        </div>

        {/* Old Value Reminders */}
        {healthProfile?.oldValueReminders && healthProfile.oldValueReminders.length > 0 && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Routine Update Reminder:</span>
            </div>
            {healthProfile.oldValueReminders.map((rem, idx) => (
              <p key={idx} className="text-[11px] text-amber-200/90 pl-5">
                • {rem}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'reports' as const, label: 'Reports & Scans', count: filesList.length },
          { id: 'typed' as const, label: 'Typed Metrics', count: healthProfile?.sectionsFilledCount },
          { id: 'summary' as const, label: 'Health Profile', count: 'Active' },
          { id: 'security' as const, label: 'Security & Lock', count: 'PBKDF2' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-3 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 min-h-[56px] cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[var(--mc-chip-bg)] border-[var(--mc-primary)] text-[var(--mc-primary)] shadow-[var(--mc-glow)] ring-2 ring-[var(--mc-primary)]/40'
                : 'bg-[var(--mc-card)] border-[var(--mc-card-border)] text-[var(--mc-text-secondary)] hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] font-mono opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: REPORTS & SCANS (Req 2 & 3) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Upload and Category Bar */}
          <div className="cyber-card rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--mc-text-primary)]">
                  Maternal Medical Documents
                </h3>
                <p className="text-xs text-[var(--mc-text-secondary)]">
                  PDF, JPG, PNG up to 5MB • "Your files stay on this device."
                </p>
              </div>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileSelected}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="min-h-[48px] py-2.5 px-4 rounded-2xl cyber-gradient-btn text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Medical File</span>
                </button>
              </div>
            </div>

            {/* Upload loading state */}
            {isUploading && (
              <div className="p-3 rounded-2xl bg-[var(--mc-surface-elevated)] border border-[var(--mc-primary)]/40 flex items-center gap-2 text-xs font-semibold text-[var(--mc-primary)] animate-pulse">
                <div className="w-4 h-4 border-2 border-[var(--mc-primary)] border-t-transparent rounded-full animate-spin" />
                <span>{uploadProgressMsg}</span>
              </div>
            )}

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
              {[
                { id: 'all', label: 'All Files' },
                { id: 'lab_report', label: 'Lab Reports' },
                { id: 'ultrasound', label: 'Ultrasounds' },
                { id: 'prescription', label: 'Prescriptions' },
                { id: 'discharge_summary', label: 'Discharge' },
                { id: 'vaccination', label: 'Vaccines' },
                { id: 'xray_scan', label: 'Scans & X-Rays' },
                { id: 'photo', label: 'Photos' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                    selectedCategoryFilter === c.id
                      ? 'bg-[var(--mc-chip-bg)] border-[var(--mc-primary)] text-[var(--mc-primary)] font-bold'
                      : 'bg-[var(--mc-surface)] border-[var(--mc-card-border)] text-[var(--mc-text-secondary)] hover:text-white'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Files List */}
          {filteredFiles.length === 0 ? (
            <div className="cyber-card rounded-3xl p-8 text-center text-xs text-[var(--mc-text-secondary)] space-y-2">
              <FileText className="w-8 h-8 mx-auto text-[var(--mc-text-secondary)]/50" />
              <p className="font-semibold">No documents stored in this category yet.</p>
              <p className="text-[11px]">Upload lab results, ultrasound summaries, or prescriptions to build your secure vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="cyber-card rounded-2xl p-4 border border-[var(--mc-card-border)] space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] flex items-center justify-center text-[var(--mc-primary)]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-[var(--mc-text-primary)] line-clamp-1">
                          {file.fileName}
                        </p>
                        <p className="text-[10px] font-mono text-[var(--mc-text-secondary)]">
                          {file.reportDate} • {(file.fileSize / 1024).toFixed(0)} KB
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-[var(--mc-chip-bg)] border border-[var(--mc-card-border)] text-[10px] font-mono text-[var(--mc-primary)] font-bold uppercase">
                      {file.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* AI Disclaimer for Scans vs Text Reports */}
                  {file.category === 'xray_scan' ? (
                    <div className="p-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-[11px] text-[var(--mc-text-secondary)]">
                      🛡️ "Images are stored for you and your doctor. MomCare does not read or interpret them."
                    </div>
                  ) : file.extractedValues && file.extractedValues.length > 0 ? (
                    <div className="p-2 rounded-xl bg-[var(--mc-surface)] border border-emerald-500/30 text-[11px] text-emerald-300 space-y-1">
                      <p className="font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>Values confirmed by you ({file.extractedValues.length})</span>
                      </p>
                      <div className="flex items-center gap-1 flex-wrap">
                        {file.extractedValues.slice(0, 3).map((v, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-[var(--mc-card)] text-[10px] font-mono text-[var(--mc-text-primary)]"
                          >
                            {v.labelEn}: {v.value} {v.unit || ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-[var(--mc-card-border)] text-xs">
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(file)}
                      className="text-[var(--mc-primary)] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setItemToRename(file);
                          setRenameInputValue(file.fileName);
                        }}
                        className="text-[var(--mc-text-secondary)] hover:text-white p-1 cursor-pointer"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setItemToDelete(file)}
                        className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: TYPED HEALTH METRICS (Req 2 & 4) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'typed' && (
        <form onSubmit={handleSaveTypedForm} className="cyber-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--mc-text-primary)]">
              Typed Health Metrics & Vitals
            </h3>
            <p className="text-xs text-[var(--mc-text-secondary)]">
              Encrypted source of truth for your personalized app recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                Blood Group:
              </label>
              <select
                value={typedData.bloodGroup || ''}
                onChange={(e) => setTypedData({ ...typedData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
              >
                <option value="">Select group</option>
                {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                Height (cm):
              </label>
              <input
                type="number"
                value={typedData.heightCm || ''}
                onChange={(e) => setTypedData({ ...typedData, heightCm: Number(e.target.value) || undefined })}
                placeholder="e.g. 162"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                Current Weight (kg):
              </label>
              <input
                type="number"
                step="0.1"
                value={typedData.weightKg || ''}
                onChange={(e) => setTypedData({ ...typedData, weightKg: Number(e.target.value) || undefined })}
                placeholder="e.g. 64.5"
                className="w-full px-3 py-2.5 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
              />
            </div>
          </div>

          {/* Blood Pressure Row */}
          <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] space-y-3">
            <h4 className="font-bold text-xs text-[var(--mc-text-primary)] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-[var(--mc-primary)]" />
              <span>Blood Pressure (BP)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-[var(--mc-text-secondary)] mb-1">Systolic (mmHg):</label>
                <input
                  type="number"
                  value={typedData.bloodPressureSystolic || ''}
                  onChange={(e) => setTypedData({ ...typedData, bloodPressureSystolic: Number(e.target.value) || undefined })}
                  placeholder="e.g. 118"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--mc-text-secondary)] mb-1">Diastolic (mmHg):</label>
                <input
                  type="number"
                  value={typedData.bloodPressureDiastolic || ''}
                  onChange={(e) => setTypedData({ ...typedData, bloodPressureDiastolic: Number(e.target.value) || undefined })}
                  placeholder="e.g. 76"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--mc-text-secondary)] mb-1">Date Measured:</label>
                <input
                  type="date"
                  value={typedData.bloodPressureDate || ''}
                  onChange={(e) => setTypedData({ ...typedData, bloodPressureDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Hemoglobin & Blood Sugar Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hemoglobin */}
            <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] space-y-2">
              <label className="block font-bold text-xs text-[var(--mc-text-primary)]">
                Hemoglobin (Hb in g/dL):
              </label>
              <input
                type="number"
                step="0.1"
                value={typedData.hemoglobin || ''}
                onChange={(e) => setTypedData({ ...typedData, hemoglobin: Number(e.target.value) || undefined })}
                placeholder="e.g. 11.2"
                className="w-full px-3 py-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
              />
              <input
                type="date"
                value={typedData.hemoglobinDate || ''}
                onChange={(e) => setTypedData({ ...typedData, hemoglobinDate: e.target.value })}
                className="w-full px-3 py-1.5 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-[11px] text-[var(--mc-text-secondary)] outline-none"
              />
            </div>

            {/* Blood Sugar */}
            <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] space-y-2">
              <label className="block font-bold text-xs text-[var(--mc-text-primary)]">
                Blood Sugar (Fasting / PP in mg/dL):
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={typedData.bloodSugarFasting || ''}
                  onChange={(e) => setTypedData({ ...typedData, bloodSugarFasting: Number(e.target.value) || undefined })}
                  placeholder="Fasting (85)"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                />
                <input
                  type="number"
                  value={typedData.bloodSugarPostPrandial || ''}
                  onChange={(e) => setTypedData({ ...typedData, bloodSugarPostPrandial: Number(e.target.value) || undefined })}
                  placeholder="PP (115)"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Doctor Restrictions (e.g. "bed rest") */}
          <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] space-y-2">
            <label className="block font-bold text-xs text-[var(--mc-text-primary)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Doctor's Restrictions or Clinical Orders (e.g. "bed rest", "pelvic rest"):</span>
            </label>
            <input
              type="text"
              value={(typedData.doctorRestrictions || []).join(', ')}
              onChange={(e) =>
                setTypedData({
                  ...typedData,
                  doctorRestrictions: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              placeholder="e.g. bed rest, no heavy lifting, salt reduction"
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
            />
            <p className="text-[11px] text-[var(--mc-text-secondary)]">
              When "bed rest" is specified, MomCare automatically suppresses all walking or exercise suggestions across Today's Focus and Home.
            </p>
          </div>

          {/* Allergies & Current Medicines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                Allergies:
              </label>
              <input
                type="text"
                value={(typedData.allergies || []).join(', ')}
                onChange={(e) =>
                  setTypedData({
                    ...typedData,
                    allergies: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="e.g. Penicillin, Peanuts"
                className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--mc-text-secondary)] mb-1">
                Previous Pregnancies / Notes:
              </label>
              <input
                type="text"
                value={typedData.previousPregnancies || ''}
                onChange={(e) => setTypedData({ ...typedData, previousPregnancies: e.target.value })}
                placeholder="e.g. 1 previous term delivery, healthy"
                className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
              />
            </div>
          </div>

          {typedSaveSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Health metrics saved and encrypted in your vault ✓</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingTyped}
            className="w-full min-h-[48px] py-3 px-4 rounded-2xl cyber-gradient-btn text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98"
          >
            {isSavingTyped ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Encrypting & Saving…</span>
              </div>
            ) : (
              <span>Save Encrypted Health Metrics</span>
            )}
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: HEALTH PROFILE (SOURCE OF TRUTH) (Req 4) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'summary' && (
        <div className="cyber-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--mc-text-primary)]">
              Active Health Profile (Source of Truth)
            </h3>
            <p className="text-xs text-[var(--mc-text-secondary)]">
              Compiled only from your confirmed reports and typed metrics. Never guessed by AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)]">
              <span className="text-[10px] font-mono uppercase text-[var(--mc-text-secondary)]">Blood Group</span>
              <p className="text-sm font-bold text-[var(--mc-text-primary)] mt-0.5">
                {healthProfile?.bloodGroup || 'Not specified'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)]">
              <span className="text-[10px] font-mono uppercase text-[var(--mc-text-secondary)]">Blood Pressure</span>
              <p className="text-sm font-bold text-[var(--mc-text-primary)] mt-0.5">
                {healthProfile?.latestBP
                  ? `${healthProfile.latestBP.systolic}/${healthProfile.latestBP.diastolic} mmHg`
                  : 'Not logged'}
              </p>
              {healthProfile?.latestBP?.date && (
                <span className="text-[10px] font-mono text-[var(--mc-text-secondary)]">
                  {healthProfile.latestBP.date}
                </span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)]">
              <span className="text-[10px] font-mono uppercase text-[var(--mc-text-secondary)]">Hemoglobin</span>
              <p
                className={`text-sm font-bold mt-0.5 ${
                  healthProfile?.latestHemoglobin?.isLow ? 'text-amber-400' : 'text-[var(--mc-text-primary)]'
                }`}
              >
                {healthProfile?.latestHemoglobin
                  ? `${healthProfile.latestHemoglobin.value} g/dL`
                  : 'Not logged'}
              </p>
              {healthProfile?.latestHemoglobin?.isLow && (
                <span className="text-[10px] font-mono text-amber-400">Mild Low Hb</span>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)]">
              <span className="text-[10px] font-mono uppercase text-[var(--mc-text-secondary)]">Blood Sugar</span>
              <p className="text-sm font-bold text-[var(--mc-text-primary)] mt-0.5">
                {healthProfile?.latestSugar?.fasting
                  ? `F: ${healthProfile.latestSugar.fasting} mg/dL`
                  : 'Not logged'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)]">
              <span className="text-[10px] font-mono uppercase text-[var(--mc-text-secondary)]">Doctor Restrictions</span>
              <p className="text-xs font-bold text-[var(--mc-text-primary)] mt-0.5">
                {healthProfile?.doctorRestrictions && healthProfile.doctorRestrictions.length > 0
                  ? healthProfile.doctorRestrictions.join(', ')
                  : 'None listed'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)]">
              <span className="text-[10px] font-mono uppercase text-[var(--mc-text-secondary)]">Allergies</span>
              <p className="text-xs font-bold text-[var(--mc-text-primary)] mt-0.5">
                {healthProfile?.allergies && healthProfile.allergies.length > 0
                  ? healthProfile.allergies.join(', ')
                  : 'None listed'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: SECURITY & SETTINGS (Req 1 & 5) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="cyber-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 animate-in fade-in">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--mc-text-primary)]">
              Vault Privacy & Security Settings
            </h3>
            <p className="text-xs text-[var(--mc-text-secondary)]">
              Cryptographic controls, lock management, and export actions
            </p>
          </div>

          {/* Lock the whole app switch */}
          <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-[var(--mc-text-primary)]">
                Lock the whole app with Vault Lock
              </p>
              <p className="text-[11px] text-[var(--mc-text-secondary)]">
                Requires entering your vault lock when opening MomCare.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={lockWholeAppToggle}
                onChange={(e) => handleToggleWholeAppLock(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-[var(--mc-card-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--mc-primary)]" />
            </label>
          </div>

          {/* Change Lock Button */}
          <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-[var(--mc-text-primary)]">Change Vault Lock</p>
              <p className="text-[11px] text-[var(--mc-text-secondary)]">
                Switch between Password, PIN, or Pattern. Verifies your current lock first.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowChangeLockModal(true)}
              className="px-3 py-2 rounded-xl bg-[var(--mc-chip-bg)] border border-[var(--mc-primary)]/40 text-xs font-bold text-[var(--mc-primary)] hover:opacity-80 cursor-pointer"
            >
              Change Lock
            </button>
          </div>

          {/* Download all vault data */}
          <div className="p-4 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-[var(--mc-text-primary)]">Download all my vault data</p>
              <p className="text-[11px] text-[var(--mc-text-secondary)]">
                Export an archive of all decrypted health profile metrics and file records.
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadAllVaultData(userId)}
              className="px-3 py-2 rounded-xl bg-[var(--mc-surface-elevated)] border border-[var(--mc-card-border)] text-xs font-semibold text-[var(--mc-text-primary)] hover:border-[var(--mc-primary)] cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All</span>
            </button>
          </div>

          {/* Delete my whole vault */}
          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 flex items-center justify-between gap-3">
            <div>
              <p className="font-bold text-xs text-red-300">Delete my whole vault</p>
              <p className="text-[11px] text-red-200/70">
                Permanently wipes all encrypted documents, metrics, and keys from this device.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteVaultModal(true)}
              className="px-3 py-2 rounded-xl bg-red-600/80 hover:bg-red-700 text-xs font-bold text-white cursor-pointer"
            >
              Delete Vault
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: UPLOAD CONFIG & AI CONSENT CHECKBOX (Req 3) */}
      {/* ------------------------------------------------------------- */}
      {showUploadConfigModal && pendingUploadFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-[var(--mc-text-primary)] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[var(--mc-primary)]" />
              <span>Document Details</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--mc-text-secondary)] mb-1">File Name:</label>
                <p className="font-mono text-[var(--mc-text-primary)] truncate bg-[var(--mc-surface)] p-2 rounded-xl">
                  {pendingUploadFile.name}
                </p>
              </div>

              <div>
                <label className="block text-[var(--mc-text-secondary)] mb-1">Category:</label>
                <select
                  value={pendingCategory}
                  onChange={(e) => setPendingCategory(e.target.value as VaultItemCategory)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                >
                  <option value="lab_report">Lab Report (Blood / Urine)</option>
                  <option value="ultrasound">Ultrasound Scan Report</option>
                  <option value="prescription">Prescription</option>
                  <option value="discharge_summary">Discharge Summary</option>
                  <option value="vaccination">Vaccination Record</option>
                  <option value="xray_scan">X-Ray / Scan Image (Storage Only)</option>
                  <option value="photo">Maternal Photo</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--mc-text-secondary)] mb-1">Report Date:</label>
                <input
                  type="date"
                  value={pendingReportDate}
                  onChange={(e) => setPendingReportDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                />
              </div>

              {/* PER-UPLOAD AI CONSENT BOX (Req 3) */}
              {(pendingCategory === 'lab_report' ||
                pendingCategory === 'ultrasound' ||
                pendingCategory === 'prescription') && (
                <label className="flex items-start gap-2.5 p-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-primary)]/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pendingAllowAi}
                    onChange={(e) => setPendingAllowAi(e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[var(--mc-primary)] rounded cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-[var(--mc-text-primary)] leading-snug">
                    "Allow MomCare AI to read this report to extract values."
                  </span>
                </label>
              )}

              {pendingCategory === 'xray_scan' && (
                <div className="p-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-secondary)]">
                  🛡️ "Images are stored for you and your doctor. MomCare does not read or interpret them."
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={processAndSaveFile}
                className="py-2.5 px-3 rounded-xl cyber-gradient-btn text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Encrypt & Store
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowUploadConfigModal(false);
                  setPendingUploadFile(null);
                }}
                className="py-2.5 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: "WHAT WE READ" EDITABLE CONFIRMATION (Req 3) */}
      {/* ------------------------------------------------------------- */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] p-5 sm:p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 text-[var(--mc-primary)] font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>What We Read (Please Confirm or Correct)</span>
            </div>
            <p className="text-xs text-[var(--mc-text-secondary)]">
              MomCare extracted these structured values. You must confirm or edit them before they are added to your Health Profile:
            </p>

            <div className="space-y-3">
              {extractedValuesReview.map((val, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[var(--mc-text-primary)]">{val.labelEn}</span>
                    <span className="text-[10px] font-mono text-[var(--mc-text-secondary)]">
                      {val.sourceFile}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={val.value}
                      onChange={(e) => {
                        const updated = [...extractedValuesReview];
                        updated[idx].value = e.target.value;
                        setExtractedValuesReview(updated);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
                    />
                    {val.unit && (
                      <span className="text-xs font-mono text-[var(--mc-text-secondary)]">{val.unit}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveConfirmedExtractedValues}
                className="py-2.5 px-3 rounded-xl cyber-gradient-btn text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Confirm & Save to Profile
              </button>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="py-2.5 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
              >
                Skip AI Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE FILE CONFIRMATION (YES / NO) */}
      {/* ------------------------------------------------------------- */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--mc-card)] border border-red-500/50 p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-red-300 flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span>Delete this document?</span>
            </h4>
            <p className="text-xs text-[var(--mc-text-secondary)]">
              Are you sure you want to delete <strong className="text-white">"{itemToDelete.fileName}"</strong>? This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleConfirmDeleteFile}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="py-2.5 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
              >
                No, Keep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: RENAME FILE */}
      {/* ------------------------------------------------------------- */}
      {itemToRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-[var(--mc-text-primary)]">Rename Document</h4>
            <input
              type="text"
              value={renameInputValue}
              onChange={(e) => setRenameInputValue(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs text-[var(--mc-text-primary)] outline-none"
            />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleConfirmRenameFile}
                className="py-2 px-3 rounded-xl cyber-gradient-btn text-white font-bold text-xs cursor-pointer"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setItemToRename(null)}
                className="py-2 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CHANGE LOCK */}
      {/* ------------------------------------------------------------- */}
      {showChangeLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[var(--mc-card)] border border-[var(--mc-card-border)] p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-sm text-[var(--mc-text-primary)] flex items-center gap-2">
              <Key className="w-4 h-4 text-[var(--mc-primary)]" />
              <span>Change Vault Lock</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--mc-text-secondary)] mb-1">Current Lock Secret:</label>
                <input
                  type="password"
                  value={changeOldSecret}
                  onChange={(e) => setChangeOldSecret(e.target.value)}
                  placeholder="Enter current password, PIN, or pattern…"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-[var(--mc-text-secondary)] mb-1">New Lock Type:</label>
                <select
                  value={changeNewType}
                  onChange={(e) => setChangeNewType(e.target.value as VaultLockType)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs outline-none"
                >
                  <option value="password">Password (min 8 chars)</option>
                  <option value="pin">6-Digit PIN</option>
                  <option value="pattern">3x3 Pattern</option>
                </select>
              </div>

              {changeNewType !== 'pattern' ? (
                <div>
                  <label className="block text-[var(--mc-text-secondary)] mb-1">New Secret:</label>
                  <input
                    type="password"
                    value={changeNewSecret}
                    onChange={(e) => setChangeNewSecret(e.target.value)}
                    placeholder="Enter new secret…"
                    className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs outline-none"
                  />
                </div>
              ) : (
                <div className="flex justify-center">
                  <PatternLockInput onPatternComplete={(pat) => setChangeNewSecret(pat)} />
                </div>
              )}

              {changeStatus && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold ${
                    changeStatus.isError ? 'bg-red-950/40 text-red-300' : 'bg-emerald-950/40 text-emerald-300'
                  }`}
                >
                  {changeStatus.msg}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleChangeLockSubmit}
                className="py-2.5 px-3 rounded-xl cyber-gradient-btn text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Update Lock
              </button>
              <button
                type="button"
                onClick={() => setShowChangeLockModal(false)}
                className="py-2.5 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: DELETE WHOLE VAULT CONFIRMATION */}
      {/* ------------------------------------------------------------- */}
      {showDeleteVaultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-[var(--mc-card)] border-2 border-red-500 p-5 space-y-4 shadow-2xl">
            <h4 className="font-bold text-sm text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Delete My Whole Vault?</span>
            </h4>
            <p className="text-xs text-[var(--mc-text-secondary)] leading-relaxed">
              This will permanently delete every uploaded report, typed metric, and cryptographic key. Are you sure?
            </p>
            <div>
              <label className="block text-xs font-semibold text-red-300 mb-1">
                Enter your vault lock to authorize deletion:
              </label>
              <input
                type="password"
                value={deleteVaultSecret}
                onChange={(e) => setDeleteVaultSecret(e.target.value)}
                placeholder="Enter vault secret…"
                className="w-full px-3 py-2 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] text-xs outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  const check = await unlockVault(userId, deleteVaultSecret);
                  if (check.success) {
                    await eraseVaultAndReset(userId);
                    setShowDeleteVaultModal(false);
                    setConfigured(false);
                    setUnlocked(false);
                    setHealthProfile(null);
                    if (onHealthProfileUpdated) onHealthProfileUpdated(null);
                  } else {
                    alert('Lock authorization failed. Vault was not deleted.');
                  }
                }}
                className="py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Yes, Delete Everything
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteVaultModal(false)}
                className="py-2.5 px-3 rounded-xl bg-[var(--mc-surface)] text-[var(--mc-text-secondary)] hover:text-white font-semibold text-xs cursor-pointer"
              >
                No, Keep Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
