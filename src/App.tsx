import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './services/firebase/config';
import { testConnection } from './services/firebase/connection';
import { getUserProfile, saveUserProfile, updateUserProfile } from './services/firebase/userService';
import { logoutUser } from './services/firebase/authService';
import { getRecentCheckins } from './services/firebase/checkinService';
import { getRecentSymptoms } from './services/firebase/symptomService';
import { getCareTasks, saveCareTask, getAppointments, getMedications } from './services/firebase/careService';
import { getMedicalReports } from './services/firebase/reportService';
import { getCommunityPosts, createCommunityPost } from './services/firebase/communityService';
import { getDemoProfile } from './services/demoStore';
import { calculatePregnancyProgress } from './utils/pregnancy';
import { useTranslation, type Language } from './translations';

import type {
  UserProfile,
  Checkin,
  SymptomRecord,
  CareTask,
  Appointment,
  Medication,
  MedicalReport,
  CommunityPost,
} from './types';

import { BottomNavigation, TopAppBar, type TabType } from './components/Navigation';
import { DesktopSidebar, type DesktopNavTarget } from './components/DesktopSidebar';
import { AiChatModal } from './components/AiChatModal';
import { DemoScenariosModal, type DemoScenario } from './components/DemoScenariosModal';
import { PresentationModal } from './components/PresentationModal';
import { UrgentSafetyModal } from './components/UrgentSafetyModal';
import { HomeScreen } from './features/home/HomeScreen';
import { PregnancyScreen } from './features/pregnancy/PregnancyScreen';
import { SymptomCenterScreen } from './features/symptoms/SymptomCenterScreen';
import { ReportsScreen } from './features/reports/ReportsScreen';
import { DoctorSummaryScreen } from './features/reports/DoctorSummaryScreen';
import { CareScreen } from './features/care/CareScreen';
import { CommunityScreen } from './features/community/CommunityScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { AuthModal } from './features/auth/AuthModal';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';
import { VitalsCheckScreen } from './features/vitals/VitalsCheckScreen';

import { Smartphone, Sparkles, Wifi, Battery, Signal, Activity, FileText, HeartPulse } from 'lucide-react';
import { useTheme } from './context/ThemeContext';
import { FloatingThemeButton } from './components/FloatingThemeButton';
import { BreathingExerciseModal } from './components/BreathingExerciseModal';
import type { AppAction } from './services/ai/commandEngine';

export default function App() {
  const { language, setLanguage, t } = useTranslation();
  const { setTheme, setColorMode } = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Demo mode state (strictly separate from real user accounts)
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Auth & Onboarding state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [pendingAuthUser, setPendingAuthUser] = useState<{ uid: string; email: string } | null>(null);

  // App navigation
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedJourneyWeek, setSelectedJourneyWeek] = useState<number>(24);
  const [subView, setSubView] = useState<'default' | 'symptoms' | 'reports' | 'doctor_summary' | 'vitals'>('default');

  // Phone frame simulation toggle
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Modals
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatPrompt, setAiChatPrompt] = useState<string | undefined>(undefined);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);

  // Application Data State
  const [recentCheckins, setRecentCheckins] = useState<Checkin[]>([]);
  const [recentSymptoms, setRecentSymptoms] = useState<SymptomRecord[]>([]);
  const [careTasks, setCareTasks] = useState<CareTask[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);

  // Calculate current week dynamically
  const progress = calculatePregnancyProgress(profile?.dueDate);
  const currentWeek = progress.weeks;

  // Boot connection check & auth listener
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userProfile = await getUserProfile(user.uid);
          if (userProfile && userProfile.onboardingCompleted) {
            setProfile(userProfile);
            if (userProfile.preferredLanguage) {
              setLanguage(userProfile.preferredLanguage);
            }
            if (userProfile.theme) {
              setTheme(userProfile.theme);
            }
            if (userProfile.colorMode) {
              setColorMode(userProfile.colorMode);
            }
            setSelectedJourneyWeek(calculatePregnancyProgress(userProfile.dueDate).weeks || 24);
            setPendingAuthUser(null);
          } else {
            // User signed in but has not finished onboarding
            setProfile(null);
            setPendingAuthUser({ uid: user.uid, email: user.email || '' });
          }
        } catch (err) {
          console.error('Error loading user profile:', err);
          setPendingAuthUser({ uid: user.uid, email: user.email || '' });
        }
      } else {
        setCurrentUser(null);
        if (!isDemoMode) {
          setProfile(null);
          setPendingAuthUser(null);
          setRecentCheckins([]);
          setRecentSymptoms([]);
          setCareTasks([]);
          setAppointments([]);
          setMedications([]);
          setReports([]);
          setCommunityPosts([]);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // Fetch / Refresh all application data for current user or demo
  const loadAppData = useCallback(async () => {
    const uid = profile?.id || (isDemoMode ? 'demo_maya_uid' : null);
    if (!uid) return;

    try {
      // 1. Checkins
      const chks = await getRecentCheckins(uid);
      setRecentCheckins(chks || []);

      // 2. Symptoms
      const syms = await getRecentSymptoms(uid);
      setRecentSymptoms(syms || []);

      // 3. Care tasks
      const tasks = await getCareTasks(uid);
      setCareTasks(tasks || []);

      // 4. Appointments
      const appts = await getAppointments(uid);
      setAppointments(appts || []);

      // 5. Medications
      const meds = await getMedications(uid);
      setMedications(meds || []);

      // 6. Reports
      const reps = await getMedicalReports(uid);
      setReports(reps || []);

      // 7. Community Posts
      const comm = await getCommunityPosts();
      setCommunityPosts(comm || []);
    } catch (err) {
      console.warn('Data load notice:', err);
    }
  }, [profile?.id, isDemoMode]);

  useEffect(() => {
    if (profile) {
      loadAppData();
    }
  }, [profile, loadAppData]);

  // Handle Demo Scenarios
  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedJourneyWeek(scenario.week);
    setActiveTab('home');
    setSubView('symptoms');
    setIsDemoModalOpen(false);
  };

  const handleOpenAiChat = (prompt?: string) => {
    setAiChatPrompt(prompt);
    setIsAiChatOpen(true);
  };

  // 1. Loading Splash Screen
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0F0913] text-[#FFF0F6] flex flex-col items-center justify-center p-6 text-center cyber-grid-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-radial from-[#FF1A75]/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 w-20 h-20 rounded-3xl bg-[#1F0E27] border border-[#FF1A75]/40 flex items-center justify-center text-[#FF1A75] mb-4 neon-glow-pink animate-pulse">
          <HeartPulse className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-black text-[#FFF0F6] tracking-tight neon-text-glow">MomCare</h2>
        <p className="text-xs text-[#E3BCCC] mt-1 font-mono tracking-widest uppercase">Maternal Cyber-Companion</p>
        <div className="mt-8 flex items-center gap-2.5 text-xs text-[#FFD1E3] font-semibold bg-[#22122A] px-4 py-2 rounded-full border border-[#FF1A75]/30 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#FF1A75] animate-ping" />
          <span>Synchronizing vital companion telemetry...</span>
        </div>
      </div>
    );
  }

  // 2. Welcome Screen: Shown when not logged in and not in demo mode
  if (!currentUser && !isDemoMode && !pendingAuthUser) {
    return (
      <>
        <WelcomeScreen
          onCreateAccount={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          onLogin={() => {
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
          onEnterDemo={() => {
            setIsDemoMode(true);
            const demoProf = getDemoProfile();
            setProfile(demoProf);
            if (demoProf.theme) {
              setTheme(demoProf.theme);
            }
            if (demoProf.colorMode) {
              setColorMode(demoProf.colorMode);
            }
            setSelectedJourneyWeek(calculatePregnancyProgress(demoProf.dueDate).weeks || 24);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthenticated={(existingProfile, authUser) => {
            if (existingProfile && existingProfile.onboardingCompleted) {
              setProfile(existingProfile);
              if (existingProfile.preferredLanguage) {
                setLanguage(existingProfile.preferredLanguage);
              }
              if (existingProfile.theme) {
                setTheme(existingProfile.theme);
              }
              if (existingProfile.colorMode) {
                setColorMode(existingProfile.colorMode);
              }
              setSelectedJourneyWeek(calculatePregnancyProgress(existingProfile.dueDate).weeks || 24);
              setActiveTab('home');
              setPendingAuthUser(null);
            } else {
              setProfile(null);
              setPendingAuthUser(authUser);
            }
          }}
        />

        {/* Floating Theme Button always visible on Welcome / Auth screens */}
        <FloatingThemeButton profile={profile} />
      </>
    );
  }

  // 3. Onboarding Flow (shown once right after sign-up or if profile is missing onboarding)
  if ((currentUser || pendingAuthUser) && (!profile || !profile.onboardingCompleted) && !isDemoMode) {
    return (
      <>
        <OnboardingFlow
          userId={currentUser?.uid || pendingAuthUser!.uid}
          email={currentUser?.email || pendingAuthUser!.email}
          initialDisplayName={currentUser?.displayName || ''}
          onCompleted={(completedProfile) => {
            setProfile(completedProfile);
            if (completedProfile.preferredLanguage) {
              setLanguage(completedProfile.preferredLanguage);
            }
            if (completedProfile.theme) {
              setTheme(completedProfile.theme);
            }
            if (completedProfile.colorMode) {
              setColorMode(completedProfile.colorMode);
            }
            setPendingAuthUser(null);
            setSelectedJourneyWeek(calculatePregnancyProgress(completedProfile.dueDate).weeks || 24);
            setActiveTab('home');
            loadAppData();
          }}
          onCancel={async () => {
            await logoutUser();
            setCurrentUser(null);
            setProfile(null);
            setPendingAuthUser(null);
          }}
        />
        {/* Floating Theme Button always visible on Onboarding screens */}
        <FloatingThemeButton profile={profile} />
      </>
    );
  }

  // 4. Main Logged-In App Screen
  const renderActiveScreen = () => {
    if (subView === 'symptoms') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSubView('default')}
              className="text-xs font-semibold text-[#9F5F6E] hover:underline flex items-center gap-1"
            >
              <span>← Back to Dashboard</span>
            </button>
            <span className="text-[11px] font-semibold text-[#766D72] bg-[#F2E1E3] px-2.5 py-0.5 rounded-full">
              Symptom Center
            </span>
          </div>
          <SymptomCenterScreen
            profile={profile}
            pregnancyWeek={currentWeek}
            recentCheckins={recentCheckins}
            recentSymptoms={recentSymptoms}
            medications={medications}
            appointments={appointments}
            onSymptomLogged={loadAppData}
            onOpenAiChat={handleOpenAiChat}
          />
        </div>
      );
    }

    if (subView === 'reports') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSubView('default')}
              className="text-xs font-semibold text-[#9F5F6E] hover:underline flex items-center gap-1"
            >
              <span>← Back to Dashboard</span>
            </button>
            <span className="text-[11px] font-semibold text-[#766D72] bg-[#F2E1E3] px-2.5 py-0.5 rounded-full">
              Medical Reports
            </span>
          </div>
          <ReportsScreen
            profile={profile}
            pregnancyWeek={currentWeek}
            reports={reports}
            onReportsUpdated={loadAppData}
            onOpenAiChat={handleOpenAiChat}
          />
        </div>
      );
    }

    if (subView === 'doctor_summary') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <button
              onClick={() => setSubView('default')}
              className="text-xs font-semibold text-[#9F5F6E] hover:underline flex items-center gap-1"
            >
              <span>← Back to Dashboard</span>
            </button>
            <span className="text-[11px] font-semibold text-[#766D72] bg-[#F2E1E3] px-2.5 py-0.5 rounded-full">
              Doctor Summary
            </span>
          </div>
          <DoctorSummaryScreen
            profile={profile}
            pregnancyWeek={currentWeek}
            recentCheckins={recentCheckins}
            recentSymptoms={recentSymptoms}
            medications={medications}
            appointments={appointments}
            onOpenAiChat={handleOpenAiChat}
            onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          />
        </div>
      );
    }

    if (subView === 'vitals') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSubView('default')}
              className="text-xs font-semibold text-[#FFD1E3] hover:underline flex items-center gap-1 font-mono"
            >
              <span>← Back to Dashboard</span>
            </button>
            <span className="text-[11px] font-semibold text-[#FFD1E3] bg-[#291026] border border-[#FF1A75]/40 px-2.5 py-0.5 rounded-full font-mono">
              Vitals Screening
            </span>
          </div>
          <VitalsCheckScreen
            profile={profile}
            pregnancyWeek={currentWeek}
            onOpenAiChat={handleOpenAiChat}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            {/* Quick sub-navigation shortcuts for Symptoms, Vitals & Reports */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <button
                onClick={() => setSubView('symptoms')}
                className="p-3 rounded-2xl bg-[#190C1F] border border-[#FF1A75]/30 hover:border-[#FF1A75] transition-all flex items-center gap-2.5 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#2A102A] text-[#FF1A75] flex items-center justify-center shrink-0 border border-[#FF1A75]/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-[#FFF0F6] block">Symptom Triage</span>
                  <span className="text-[10px] text-[#E3BCCC] font-mono">Sensations</span>
                </div>
              </button>

              <button
                onClick={() => setSubView('vitals')}
                className="p-3 rounded-2xl bg-[#210D25] border border-[#FF1A75]/50 hover:border-[#FF1A75] transition-all flex items-center gap-2.5 shadow-[0_0_12px_rgba(255,26,117,0.25)] ring-1 ring-[#FF1A75]/30 group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF1A75] to-[#B80048] text-white flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,26,117,0.4)]">
                  <HeartPulse className="w-4 h-4 group-hover:scale-110 transition-transform stroke-[2.3]" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-[#FFF0F6] block flex items-center gap-1">
                    <span>Vitals Check</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-[#FF1A75]/30 text-[#FFD1E3]">
                      ML
                    </span>
                  </span>
                  <span className="text-[10px] text-[#FFD1E3] font-mono">BP & Sugar</span>
                </div>
              </button>

              <button
                onClick={() => setSubView('reports')}
                className="p-3 rounded-2xl bg-[#190C1F] border border-[#FF1A75]/30 hover:border-[#FF1A75] transition-all flex items-center gap-2.5 shadow-sm"
              >
                <div className="w-8 h-8 rounded-xl bg-[#2A102A] text-[#FF1A75] flex items-center justify-center shrink-0 border border-[#FF1A75]/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-[#FFF0F6] block">Medical Reports</span>
                  <span className="text-[10px] text-[#E3BCCC] font-mono">Explain scans</span>
                </div>
              </button>
            </div>

            <HomeScreen
              profile={profile}
              recentCheckins={recentCheckins}
              careTasks={careTasks}
              recentSymptoms={recentSymptoms}
              onRefreshData={loadAppData}
              onOpenJourney={(wk) => {
                if (wk) setSelectedJourneyWeek(wk);
                setActiveTab('pregnancy');
                setSubView('default');
              }}
              onOpenSymptomCenter={() => setSubView('symptoms')}
              onOpenAiChat={handleOpenAiChat}
              onOpenReports={() => setSubView('reports')}
              onOpenVitals={() => setSubView('vitals')}
            />
          </div>
        );

      case 'pregnancy':
        return (
          <PregnancyScreen
            currentWeek={currentWeek}
            selectedWeek={selectedJourneyWeek}
            onSelectWeek={setSelectedJourneyWeek}
            recentCheckins={recentCheckins}
            recentSymptoms={recentSymptoms}
            onOpenAiChat={handleOpenAiChat}
          />
        );

      case 'community':
        return (
          <CommunityScreen
            profile={profile}
            pregnancyWeek={currentWeek}
            posts={communityPosts}
            onPostsUpdated={loadAppData}
            onOpenAiChat={handleOpenAiChat}
          />
        );

      case 'care':
        return (
          <CareScreen
            profile={profile}
            pregnancyWeek={currentWeek}
            careTasks={careTasks}
            appointments={appointments}
            medications={medications}
            onDataUpdated={loadAppData}
            onOpenAiChat={handleOpenAiChat}
          />
        );

      case 'profile':
        return (
          <ProfileScreen
            profile={profile}
            pregnancyWeek={currentWeek}
            onProfileUpdated={loadAppData}
            onLogout={async () => {
              await logoutUser();
              setCurrentUser(null);
              setProfile(null);
              setIsDemoMode(false);
              setPendingAuthUser(null);
              setRecentCheckins([]);
              setRecentSymptoms([]);
              setCareTasks([]);
              setAppointments([]);
              setMedications([]);
              setReports([]);
              setCommunityPosts([]);
              setActiveTab('home');
              setSubView('default');
            }}
            isPhoneFrame={isPhoneFrame}
            onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          />
        );

      default:
        return null;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setProfile(null);
    setIsDemoMode(false);
    setPendingAuthUser(null);
    setRecentCheckins([]);
    setRecentSymptoms([]);
    setCareTasks([]);
    setAppointments([]);
    setMedications([]);
    setReports([]);
    setCommunityPosts([]);
    setActiveTab('home');
    setSubView('default');
  };

  const handleDesktopNavigate = (target: DesktopNavTarget) => {
    switch (target) {
      case 'home':
        setActiveTab('home');
        setSubView('default');
        break;
      case 'vitals':
        setSubView('vitals');
        break;
      case 'checkin':
        setActiveTab('home');
        setSubView('default');
        // Checkin card is at the top of HomeScreen
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'baby':
        setActiveTab('pregnancy');
        setSubView('default');
        break;
      case 'ask':
        handleOpenAiChat();
        break;
      case 'reports':
        setSubView('reports');
        break;
      case 'doctor_summary':
        setSubView('doctor_summary');
        break;
      case 'circle':
        setActiveTab('community');
        setSubView('default');
        break;
      case 'learn':
        setActiveTab('pregnancy');
        setSubView('default');
        break;
      case 'profile':
        setActiveTab('profile');
        setSubView('default');
        break;
    }
  };

  // Chatbot Controlled App Actions with Yes/No Confirmation (Part 4)
  const handleExecuteAppAction = (action: AppAction) => {
    switch (action.type) {
      case 'navigate_home':
        setActiveTab('home');
        setSubView('default');
        break;
      case 'navigate_checkin':
        setActiveTab('home');
        setSubView('default');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'navigate_baby':
        setActiveTab('pregnancy');
        setSubView('default');
        break;
      case 'navigate_ask':
        setIsAiChatOpen(true);
        break;
      case 'navigate_reports':
        setSubView('reports');
        break;
      case 'navigate_doctor_summary':
        setSubView('doctor_summary');
        break;
      case 'navigate_circle':
        setActiveTab('community');
        setSubView('default');
        break;
      case 'navigate_learn':
        setActiveTab('pregnancy');
        setSubView('default');
        break;
      case 'navigate_vitals':
        setSubView('vitals');
        break;
      case 'navigate_profile':
      case 'navigate_settings':
        setActiveTab('profile');
        setSubView('default');
        break;
      case 'set_theme':
        if (action.payload?.theme) {
          setTheme(action.payload.theme);
          if (profile) updateUserProfile(profile.id, { theme: action.payload.theme });
        }
        break;
      case 'set_mode':
        if (action.payload?.mode) {
          setColorMode(action.payload.mode);
          if (profile) updateUserProfile(profile.id, { colorMode: action.payload.mode });
        }
        break;
      case 'set_language':
        if (action.payload?.language) {
          setLanguage(action.payload.language);
          if (profile) updateUserProfile(profile.id, { preferredLanguage: action.payload.language });
        }
        break;
      case 'start_checkin':
        setActiveTab('home');
        setSubView('default');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'start_breathing':
        setIsBreathingModalOpen(true);
        break;
      case 'print_doctor_summary':
        setSubView('doctor_summary');
        setTimeout(() => window.print(), 500);
        break;
      case 'download_data': {
        const dataObj = {
          profile,
          pregnancyWeek: currentWeek,
          checkins: recentCheckins,
          symptoms: recentSymptoms,
          medications,
          appointments,
          exportedAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(dataObj, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MomCare_Data_${profile?.displayName || profile?.preferredName || 'Mother'}_Week${currentWeek}.json`;
        a.click();
        URL.revokeObjectURL(url);
        break;
      }
      case 'show_call_doctor': {
        const phone = profile?.emergencyContact || profile?.familyContactPhone || profile?.doctorPhone || '108';
        window.location.href = `tel:${phone}`;
        break;
      }
      case 'show_ambulance':
        window.location.href = 'tel:108';
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  // Derive active desktop target
  const getDesktopActiveTarget = (): DesktopNavTarget => {
    if (subView === 'vitals') return 'vitals';
    if (subView === 'reports') return 'reports';
    if (subView === 'doctor_summary') return 'doctor_summary';
    if (activeTab === 'home') return 'home';
    if (activeTab === 'pregnancy') return 'baby';
    if (activeTab === 'community') return 'circle';
    if (activeTab === 'care') return 'checkin';
    if (activeTab === 'profile') return 'profile';
    return 'home';
  };

  return (
    <div className={`min-h-screen bg-[var(--mc-bg)] text-[var(--mc-text-primary)] flex ${isPhoneFrame ? 'items-center justify-center p-0 sm:p-6 bg-gradient-to-br from-[var(--mc-bg)] via-[var(--mc-surface)] to-[var(--mc-bg)]' : 'flex-col lg:flex-row'}`}>
      {/* Desktop Fixed Left Sidebar (>= 1024px, hidden in phone simulation mode) */}
      {!isPhoneFrame && (
        <DesktopSidebar
          profile={profile}
          pregnancyWeek={currentWeek}
          activeTarget={getDesktopActiveTarget()}
          onNavigate={handleDesktopNavigate}
          onOpenAiChat={() => handleOpenAiChat()}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          onLogout={handleLogout}
          isDemoMode={isDemoMode}
        />
      )}

      {/* Main Content Area: Responsive across phones, tablets, and desktop */}
      <div
        className={`w-full bg-[var(--mc-bg)] flex flex-col relative transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[412px] h-[92vh] max-h-[890px] rounded-[36px] shadow-2xl border-[6px] border-[var(--mc-primary)]/40 overflow-hidden neon-glow-theme'
            : 'flex-1 min-h-screen'
        }`}
      >
        {/* Android Status Bar (shown only on mobile view or phone frame) */}
        <div className={`bg-[var(--mc-surface)] px-5 pt-2 pb-1 items-center justify-between text-[11px] font-mono text-[var(--mc-text-secondary)] select-none border-b border-[var(--mc-card-border)] ${isPhoneFrame ? 'flex' : 'flex lg:hidden'}`}>
          <span className="tracking-wider">09:41 · 5G</span>
          <div className="flex items-center gap-1.5 text-[var(--mc-text-primary)]">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-[var(--mc-primary)]" />
          </div>
        </div>

        {/* Top App Bar with MomCare branding & conditional demo controls */}
        <TopAppBar
          profile={profile}
          pregnancyWeek={currentWeek}
          onOpenAiChat={() => handleOpenAiChat()}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          onOpenEmergency={() => setIsEmergencyModalOpen(true)}
          isPhoneFrame={isPhoneFrame}
          onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
          isDemoMode={isDemoMode}
          onExitDemo={() => {
            setIsDemoMode(false);
            setProfile(null);
            setRecentCheckins([]);
            setRecentSymptoms([]);
            setCareTasks([]);
            setAppointments([]);
            setMedications([]);
            setReports([]);
            setCommunityPosts([]);
            setActiveTab('home');
            setSubView('default');
          }}
          onLanguageChange={(newLang) => {
            setLanguage(newLang);
            if (profile) {
              updateUserProfile(profile.id, { preferredLanguage: newLang });
            }
          }}
        />

        {/* Main Scrollable View Area: Centered with max-w-[1200px] on desktop */}
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="w-full max-w-[1200px] mx-auto pb-20 lg:pb-8">
            {renderActiveScreen()}
          </div>
        </main>

        {/* Bottom Navigation: Phone & Tablet (hidden on desktop >=1024px) */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setSubView('default');
          }}
          onOpenAiChat={() => handleOpenAiChat()}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          pregnancyWeek={currentWeek}
        />

        {/* Navigation Pill Indicator (mobile/phone simulation only) */}
        <div className={`bg-[#FFFFFF] pb-1.5 justify-center safe-area-bottom ${isPhoneFrame ? 'flex' : 'flex lg:hidden'}`}>
          <div className="w-32 h-1 bg-[#352F35]/20 rounded-full" />
        </div>
      </div>

      {/* Global AI Chat Modal / Right Docked Panel */}
      <AiChatModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        profile={profile}
        pregnancyWeek={currentWeek}
        recentCheckins={recentCheckins}
        recentSymptoms={recentSymptoms}
        medications={medications}
        appointments={appointments}
        initialPrompt={aiChatPrompt}
        language={language}
        onExecuteAction={handleExecuteAppAction}
        onOpenBreathing={() => setIsBreathingModalOpen(true)}
      />

      {/* Guided Breathing Exercise Modal (Part 4 Activity) */}
      <BreathingExerciseModal
        isOpen={isBreathingModalOpen}
        onClose={() => setIsBreathingModalOpen(false)}
      />

      {/* Presentation Demo Scenarios Modal (Section 39) */}
      <DemoScenariosModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={handleSelectScenario}
      />

      {/* 15-Slide Presentation Deck Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
        onOpenLiveDemo={() => setIsDemoModalOpen(true)}
      />

      {/* Floating Theme Button always visible on all logged-in screens */}
      <FloatingThemeButton profile={profile} />
    </div>
  );
}
