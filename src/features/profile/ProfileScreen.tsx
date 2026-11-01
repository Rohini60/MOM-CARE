import React, { useState } from 'react';
import {
  User,
  Heart,
  Calendar,
  ShieldCheck,
  Smartphone,
  Trash2,
  LogOut,
  Save,
  AlertTriangle,
  Lock,
  Phone,
  Hospital,
  Clock,
  Sparkles,
  Info,
  Download,
  Globe,
  CheckCircle2,
  Camera,
  Upload,
  Image as ImageIcon,
  FolderLock,
  ChevronRight,
} from 'lucide-react';
import type { UserProfile } from '../../types';
import { updateUserProfile, deleteUserData } from '../../services/firebase/userService';
import { logoutUser } from '../../services/firebase/authService';
import { getRecentCheckins } from '../../services/firebase/checkinService';
import { getRecentSymptoms } from '../../services/firebase/symptomService';
import { getCareTasks, getAppointments } from '../../services/firebase/careService';
import { useTranslation, type Language } from '../../translations';
import { ThemeSelector } from '../../components/ThemeSelector';

interface ProfileScreenProps {
  profile: UserProfile | null;
  pregnancyWeek: number;
  onProfileUpdated: () => void;
  onLogout: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  onOpenVault?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  pregnancyWeek,
  onProfileUpdated,
  onLogout,
  isPhoneFrame,
  onTogglePhoneFrame,
  onOpenVault,
}) => {
  const { language, setLanguage, t } = useTranslation();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [preferredName, setPreferredName] = useState(profile?.preferredName || profile?.displayName || '');
  const [age, setAge] = useState<string>(profile?.age ? String(profile.age) : '28');
  const [babyNickname, setBabyNickname] = useState(profile?.babyNickname || '');
  const [dueDate, setDueDate] = useState(profile?.dueDate || '');
  const [firstPregnancy, setFirstPregnancy] = useState(profile?.firstPregnancy ?? true);

  // Emergency contacts
  const [familyContactName, setFamilyContactName] = useState(profile?.familyContactName || '');
  const [familyContactPhone, setFamilyContactPhone] = useState(profile?.familyContactPhone || '');
  const [doctorName, setDoctorName] = useState(profile?.doctorName || '');
  const [doctorPhone, setDoctorPhone] = useState(profile?.doctorPhone || '');
  const [clinicName, setClinicName] = useState(profile?.clinicName || '');

  // Privacy & Preferences
  const [saveAiHistory, setSaveAiHistory] = useState(profile?.saveAiHistory ?? true);
  const [communityAnonymous, setCommunityAnonymous] = useState(profile?.communityAnonymous ?? false);

  // User Photo Option State
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile?.photoUrl || null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (profile) {
      updateUserProfile(profile.id, { preferredLanguage: newLang });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPEG, PNG, or WebP)');
      return;
    }

    setIsProcessingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetSize = 256;
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setPhotoUrl(compressedDataUrl);
          if (profile?.id) {
            updateUserProfile(profile.id, { photoUrl: compressedDataUrl });
            onProfileUpdated();
          }
        }
        setIsProcessingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (emoji: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#26112D';
      ctx.beginPath();
      ctx.arc(64, 64, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '64px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 64, 70);
      const dataUrl = canvas.toDataURL('image/png');
      setPhotoUrl(dataUrl);
      if (profile?.id) {
        updateUserProfile(profile.id, { photoUrl: dataUrl });
        onProfileUpdated();
      }
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    if (profile?.id) {
      updateUserProfile(profile.id, { photoUrl: null });
      onProfileUpdated();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSaveError(false);
    try {
      await updateUserProfile(profile.id, {
        displayName: displayName.trim(),
        preferredName: preferredName.trim() || displayName.trim(),
        photoUrl: photoUrl || null,
        age: age ? parseInt(age, 10) : null,
        babyNickname: babyNickname.trim() ? babyNickname.trim() : null,
        dueDate,
        firstPregnancy,
        preferredLanguage: language,
        familyContactName: familyContactName.trim() ? familyContactName.trim() : null,
        familyContactPhone: familyContactPhone.trim() ? familyContactPhone.trim() : null,
        doctorName: doctorName.trim() ? doctorName.trim() : null,
        doctorPhone: doctorPhone.trim() ? doctorPhone.trim() : null,
        clinicName: clinicName.trim() ? clinicName.trim() : null,
        emergencyContact: familyContactPhone.trim()
          ? `${familyContactName || 'Family'}: ${familyContactPhone}`
          : doctorPhone.trim()
          ? `${doctorName || 'Doctor'}: ${doctorPhone}`
          : null,
        saveAiHistory,
        communityAnonymous,
      });
      setSaveSuccess(true);
      onProfileUpdated();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Update profile error:', err);
      setSaveError(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadMyData = async () => {
    if (!profile) return;
    setIsDownloading(true);
    try {
      const [checkins, symptoms, tasks, appts] = await Promise.all([
        getRecentCheckins(profile.id, 50),
        getRecentSymptoms(profile.id, 50),
        getCareTasks(profile.id),
        getAppointments(profile.id),
      ]);

      const dataPayload = {
        exportedAt: new Date().toISOString(),
        profile,
        checkinHistory: checkins,
        symptomRecords: symptoms,
        prenatalCareTasks: tasks,
        appointments: appts,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute(
        'download',
        `MomCare_MyData_${profile.displayName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Download data error:', err);
      alert(t.errSaveGeneral);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (!profile) return;
    setIsDeleting(true);
    try {
      await deleteUserData(profile.id);
      await logoutUser();
      onLogout();
    } catch (err) {
      console.error('Delete data error:', err);
      alert(t.errSaveGeneral);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in">
      {/* 1. TOP SECTION: Choose your MomCare look */}
      <div className="bg-[var(--mc-card)] rounded-3xl p-5 border-2 border-[var(--mc-card-border)] shadow-[var(--mc-glow)] space-y-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[var(--mc-btn-gradient)] flex items-center justify-center text-white shadow-xs">
            <span className="text-xl">🎨</span>
          </div>
          <div>
            <h2 className="font-extrabold text-base text-[var(--mc-text-primary)]">
              Choose your MomCare look
            </h2>
            <p className="text-xs text-[var(--mc-text-secondary)] font-mono">
              Switch between Neon Blue and Neon Pink, with Dark or Light mode
            </p>
          </div>
        </div>

        {/* Two large preview cards and Dark/Light switch below them */}
        <ThemeSelector profile={profile} />
      </div>

      {/* Header Card */}
      <div className="bg-[var(--mc-card)] rounded-2xl p-4 sm:p-5 border border-[var(--mc-card-border)] shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 rounded-2xl bg-[var(--mc-chip-bg)] border-2 border-[var(--mc-primary)] shadow-[var(--mc-glow)] flex items-center justify-center relative cursor-pointer group overflow-hidden shrink-0"
            title="Click to upload or change profile photo"
          >
            {photoUrl ? (
              <img src={photoUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-black text-[var(--mc-primary)]">
                {displayName.charAt(0) || 'M'}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-5 h-5 drop-shadow-md" />
            </div>
            <div className="absolute bottom-0 right-0 p-1 bg-[var(--mc-primary)] text-white rounded-tl-lg shadow-xs">
              <Camera className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <h2 className="font-bold text-base text-[var(--mc-text-primary)]">
              {preferredName || displayName || 'MomCare Member'}
            </h2>
            <p className="text-xs text-[var(--mc-text-secondary)]">{profile?.email || 'Logged In Account'}</p>
            <span className="text-[10px] font-semibold text-[var(--mc-primary)] bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] px-2 py-0.5 rounded-full inline-block mt-0.5">
              Week {pregnancyWeek} with {babyNickname || t.yourBaby}
            </span>
          </div>
        </div>

        <button
          onClick={async () => {
            await logoutUser();
            onLogout();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--mc-card-border)] text-[var(--mc-text-secondary)] hover:text-[#C96B6B] text-xs font-semibold hover:bg-[var(--mc-chip-bg)] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t.logoutBtn}</span>
        </button>
      </div>

      {/* 2. SECTION: My Health Vault (Requirement 1) */}
      <div className="bg-[var(--mc-card)] rounded-3xl p-5 border-2 border-[var(--mc-primary)]/40 shadow-[var(--mc-glow)] space-y-3.5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--mc-primary)]/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--mc-btn-gradient)] flex items-center justify-center text-white shadow-md shrink-0">
              <FolderLock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-[var(--mc-text-primary)]">
                  My Health Vault
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-[var(--mc-chip-bg)] border border-[var(--mc-primary)]/40 text-[10px] font-mono text-[var(--mc-primary)] font-bold">
                  AES-256
                </span>
              </div>
              <p className="text-xs text-[var(--mc-text-secondary)]">
                Securely store lab reports, ultrasound scans & health vitals encrypted on your device.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenVault}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl cyber-gradient-btn text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-102 active:scale-98 transition-all cursor-pointer shrink-0"
          >
            <span>Open Health Vault</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hidden File Input for Profile Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
        aria-label="Upload profile photo"
      />

      {/* Profile Photo Option Card */}
      <div className="cyber-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[var(--mc-primary)]">
            <Camera className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[var(--mc-text-primary)]">
              {t.profilePhotoTitle}
            </h3>
          </div>
          {isProcessingPhoto && (
            <span className="text-[11px] font-mono text-[var(--mc-primary)] animate-pulse">
              Optimizing image...
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--mc-text-secondary)]">
          Add your photo or select a maternal avatar to personalize your MomCare experience.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
          {/* Avatar Preview */}
          <div className="relative group shrink-0">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-3xl bg-[var(--mc-surface)] border-2 border-[var(--mc-primary)] shadow-[var(--mc-glow)] flex items-center justify-center overflow-hidden cursor-pointer"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--mc-text-muted)] bg-[var(--mc-chip-bg)]">
                  <Camera className="w-7 h-7 stroke-[1.8] text-[var(--mc-primary)]" />
                  <span className="text-[9px] font-mono uppercase mt-1">No Photo</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--mc-btn-gradient)] text-white flex items-center justify-center shadow-md border-2 border-[var(--mc-surface)] cursor-pointer hover:scale-110 transition-transform"
              title="Upload new photo"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons & Presets */}
          <div className="flex-1 space-y-2.5 w-full text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingPhoto}
                className="px-3.5 py-2 rounded-xl bg-[var(--mc-btn-gradient)] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{t.uploadPhotoBtn}</span>
              </button>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 rounded-xl border border-[var(--mc-card-border)] hover:border-[#FF003C] hover:text-[#FF003C] text-[var(--mc-text-secondary)] text-xs font-semibold transition-all cursor-pointer"
                >
                  {t.removePhotoBtn}
                </button>
              )}
            </div>

            {/* Quick Maternal Avatar Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-mono font-medium text-[var(--mc-text-muted)] block">
                {t.chooseAvatarPreset}:
              </span>
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                {[
                  { emoji: '🌸', label: 'Bloom' },
                  { emoji: '🤰', label: 'Expecting' },
                  { emoji: '🤱', label: 'Nurture' },
                  { emoji: '💖', label: 'Radiant' },
                  { emoji: '👶', label: 'Angel' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset.emoji)}
                    className="w-9 h-9 rounded-xl bg-[var(--mc-surface)] border border-[var(--mc-card-border)] hover:border-[var(--mc-primary)] hover:scale-110 flex items-center justify-center text-lg transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={`Select ${preset.label} avatar`}
                  >
                    <span>{preset.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Language Switcher in Settings (Part 2 requirement) */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2 text-[#9F5F6E]">
          <Globe className="w-4 h-4" />
          <h3 className="font-bold text-sm text-[#352F35]">{t.preferredLanguageLabel}</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { code: 'en', label: 'English' },
            { code: 'ta', label: 'தமிழ்' },
            { code: 'hi', label: 'हिंदी' },
          ].map((langItem) => (
            <button
              key={langItem.code}
              type="button"
              onClick={() => handleLanguageChange(langItem.code as Language)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                language === langItem.code
                  ? 'bg-[#9F5F6E] text-white border-[#9F5F6E] shadow-2xs'
                  : 'bg-[#FCF8F6] text-[#766D72] border-[#E9DFDC] hover:bg-[#F2E1E3]'
              }`}
            >
              {langItem.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-4">
        {/* Personal Details */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-[#352F35]">{t.personalInfo}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[#766D72] mb-1 font-medium">{t.fullNameLabel}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35] focus:outline-hidden focus:border-[#C98291]"
              />
            </div>

            <div>
              <label className="block text-[#766D72] mb-1 font-medium">{t.nicknameLabel}</label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35] focus:outline-hidden focus:border-[#C98291]"
              />
            </div>

            <div>
              <label className="block text-[#766D72] mb-1 font-medium">{t.ageLabel}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35] focus:outline-hidden focus:border-[#C98291]"
              />
            </div>

            <div>
              <label className="block text-[#766D72] mb-1 font-medium">{t.babyNicknameLabel}</label>
              <input
                type="text"
                value={babyNickname}
                onChange={(e) => setBabyNickname(e.target.value)}
                placeholder={t.babyNicknamePlaceholder}
                className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35] focus:outline-hidden focus:border-[#C98291]"
              />
            </div>

            {/* ONLY Due Date asked (Part 1 requirement) */}
            <div className="sm:col-span-2">
              <label className="block text-[#766D72] mb-1 font-medium">{t.dueDateLabel}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35] focus:outline-hidden focus:border-[#C98291]"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contacts & Doctor */}
        <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-[#9F5F6E]">
            <Phone className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[#352F35]">{t.emergencyContactsTeam}</h3>
          </div>
          <p className="text-[11px] text-[#766D72]">
            {t.emergencyHelper}
          </p>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[#766D72] mb-1 font-medium">{t.familyContactTitle}</label>
                <input
                  type="text"
                  value={familyContactName}
                  onChange={(e) => setFamilyContactName(e.target.value)}
                  placeholder={t.familyContactNamePlaceholder}
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
              <div>
                <label className="block text-[#766D72] mb-1 font-medium">Phone</label>
                <input
                  type="tel"
                  value={familyContactPhone}
                  onChange={(e) => setFamilyContactPhone(e.target.value)}
                  placeholder="+1 555-0192"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[#766D72] mb-1 font-medium">{t.doctorContactTitle}</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder={t.doctorNamePlaceholder}
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
              <div>
                <label className="block text-[#766D72] mb-1 font-medium">Doctor Phone</label>
                <input
                  type="tel"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  placeholder="+1 555-0123"
                  className="w-full bg-[#FCF8F6] border border-[#E9DFDC] rounded-xl px-3 py-2 text-xs text-[#352F35]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MomCare Look & Theme Settings */}
        <div className="cyber-card rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-[var(--mc-primary)]">
            <Sparkles className="w-4 h-4" />
            <h3 className="font-bold text-sm text-[var(--mc-text-primary)]">
              Choose your MomCare look
            </h3>
          </div>
          <p className="text-xs text-[var(--mc-text-muted)]">
            Select your preferred theme and mode. Changes apply immediately and save to your profile.
          </p>

          <ThemeSelector
            onThemeSelect={(newTheme) => {
              if (profile?.id) {
                updateUserProfile(profile.id, { theme: newTheme });
              }
            }}
            onModeSelect={(newMode) => {
              if (profile?.id) {
                updateUserProfile(profile.id, { colorMode: newMode });
              }
            }}
          />
        </div>

        {/* Save Changes Button with Feedback */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3 px-4 rounded-xl cyber-gradient-btn text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? t.savingChanges : t.saveChanges}</span>
          </button>

          {saveSuccess && (
            <span className="text-xs font-semibold text-[#2E7D32] animate-in fade-in flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{t.savedSuccess}</span>
            </span>
          )}

          {saveError && (
            <span className="text-xs font-semibold text-[#C62828] animate-in fade-in flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>{t.errSaveGeneral}</span>
            </span>
          )}
        </div>
      </form>

      {/* Data Export & Account Deletion */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 sm:p-5 border border-[#E9DFDC] shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-[#352F35]">{t.privacyDataControlTitle}</h3>
        <p className="text-xs text-[#766D72] leading-relaxed">
          {t.privacyDataControlDesc}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          {/* Download My Data */}
          <button
            type="button"
            onClick={handleDownloadMyData}
            disabled={isDownloading}
            className="flex-1 py-2.5 px-3 rounded-xl border border-[#E9DFDC] bg-white hover:bg-[#FCF8F6] text-[#352F35] text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs"
          >
            <Download className="w-4 h-4 text-[#9F5F6E]" />
            <span>{isDownloading ? '...' : t.downloadMyData}</span>
          </button>

          {/* Delete Account & Data */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="py-2.5 px-3 rounded-xl border border-[#FADADD] bg-[#FFF0F2] hover:bg-[#FFE5E8] text-[#C62828] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.deleteAccountData}</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B1F24]/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-[#FCF8F6] rounded-3xl p-6 max-w-sm w-full border border-[#E9DFDC] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0F2] text-[#C62828] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-bold text-base text-[#352F35]">{t.deleteConfirmTitle}</h4>
              <p className="text-xs text-[#766D72] leading-relaxed">
                {t.deleteConfirmDesc}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#E9DFDC] bg-white text-xs font-semibold text-[#766D72]"
              >
                {t.cancelBtn}
              </button>
              <button
                type="button"
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold transition-all disabled:opacity-40"
              >
                {isDeleting ? '...' : t.deleteConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
