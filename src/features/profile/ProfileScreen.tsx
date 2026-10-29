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
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  pregnancyWeek,
  onProfileUpdated,
  onLogout,
  isPhoneFrame,
  onTogglePhoneFrame,
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSaveError(false);
    try {
      await updateUserProfile(profile.id, {
        displayName: displayName.trim(),
        preferredName: preferredName.trim() || displayName.trim(),
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
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--mc-chip-bg)] border border-[var(--mc-chip-border)] flex items-center justify-center text-lg font-bold text-[var(--mc-primary)]">
            {displayName.charAt(0) || 'M'}
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
