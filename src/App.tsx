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
import { AiChatModal } from './components/AiChatModal';
import { DemoScenariosModal, type DemoScenario } from './components/DemoScenariosModal';
import { PresentationModal } from './components/PresentationModal';
import { HomeScreen } from './features/home/HomeScreen';
import { PregnancyScreen } from './features/pregnancy/PregnancyScreen';
import { SymptomCenterScreen } from './features/symptoms/SymptomCenterScreen';
import { ReportsScreen } from './features/reports/ReportsScreen';
import { CareScreen } from './features/care/CareScreen';
import { CommunityScreen } from './features/community/CommunityScreen';
import { ProfileScreen } from './features/profile/ProfileScreen';
import { WelcomeScreen } from './features/welcome/WelcomeScreen';
import { AuthModal } from './features/auth/AuthModal';
import { OnboardingFlow } from './features/onboarding/OnboardingFlow';

import { Smartphone, Sparkles, Wifi, Battery, Signal, Activity, FileText, HeartPulse } from 'lucide-react';

export default function App() {
  const { language, setLanguage, t } = useTranslation();
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
  const [subView, setSubView] = useState<'default' | 'symptoms' | 'reports'>('default');

  // Phone frame simulation toggle
  const [isPhoneFrame, setIsPhoneFrame] = useState(false);

  // Modals
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [aiChatPrompt, setAiChatPrompt] = useState<string | undefined>(undefined);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

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
      <div className="min-h-screen bg-[#FCF8F6] text-[#352F35] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#F2E1E3] flex items-center justify-center text-[#9F5F6E] mb-4 shadow-sm animate-pulse">
          <HeartPulse className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="text-xl font-black text-[#352F35]">MomCare</h2>
        <p className="text-xs text-[#766D72] mt-1">Your safe companion through pregnancy</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-[#9F5F6E] font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#9F5F6E] animate-ping" />
          <span>Opening your companion...</span>
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
              setSelectedJourneyWeek(calculatePregnancyProgress(existingProfile.dueDate).weeks || 24);
              setActiveTab('home');
              setPendingAuthUser(null);
            } else {
              setProfile(null);
              setPendingAuthUser(authUser);
            }
          }}
        />
      </>
    );
  }

  // 3. Onboarding Flow (shown once right after sign-up or if profile is missing onboarding)
  if ((currentUser || pendingAuthUser) && (!profile || !profile.onboardingCompleted) && !isDemoMode) {
    return (
      <OnboardingFlow
        userId={currentUser?.uid || pendingAuthUser!.uid}
        email={currentUser?.email || pendingAuthUser!.email}
        initialDisplayName={currentUser?.displayName || ''}
        onCompleted={(completedProfile) => {
          setProfile(completedProfile);
          if (completedProfile.preferredLanguage) {
            setLanguage(completedProfile.preferredLanguage);
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

    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-4">
            {/* Quick sub-navigation shortcuts for Symptoms & Reports */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setSubView('symptoms')}
                className="p-2.5 rounded-2xl bg-white border border-[#E9DFDC] hover:border-[#C98291] transition-all flex items-center gap-2 shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#F2E1E3] text-[#9F5F6E] flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-[#352F35] block">Symptom Triage</span>
                  <span className="text-[10px] text-[#766D72]">Evaluate sensations</span>
                </div>
              </button>

              <button
                onClick={() => setSubView('reports')}
                className="p-2.5 rounded-2xl bg-white border border-[#E9DFDC] hover:border-[#C98291] transition-all flex items-center gap-2 shadow-2xs"
              >
                <div className="w-7 h-7 rounded-xl bg-[#EFEBF4] text-[#7E699B] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-[#352F35] block">Medical Reports</span>
                  <span className="text-[10px] text-[#766D72]">Explain scans & labs</span>
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

  return (
    <div className={`min-h-screen bg-[#FCF8F6] text-[#352F35] flex flex-col ${isPhoneFrame ? 'items-center justify-center p-0 sm:p-6' : ''}`}>
      {/* Device wrapper container */}
      <div
        className={`w-full bg-[#FCF8F6] flex flex-col relative transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[412px] h-[92vh] max-h-[890px] rounded-[36px] shadow-2xl border-[8px] border-[#352F35] overflow-hidden'
            : 'max-w-md mx-auto min-h-screen'
        }`}
      >
        {/* Android Status Bar */}
        <div className="bg-[#FCF8F6] px-5 pt-2 pb-1 flex items-center justify-between text-[11px] font-semibold text-[#352F35] select-none border-b border-[#E9DFDC]/30">
          <span>9:41</span>
          <div className="flex items-center gap-1.5 text-[#352F35]">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Top App Bar with MomCare branding & conditional demo controls */}
        <TopAppBar
          pregnancyWeek={currentWeek}
          onOpenAiChat={() => handleOpenAiChat()}
          onOpenDemo={() => setIsDemoModalOpen(true)}
          onOpenPresentation={() => setIsPresentationOpen(true)}
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

        {/* Main Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 py-3">
          {renderActiveScreen()}
        </main>

        {/* Bottom Navigation */}
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

        {/* Navigation Pill Indicator */}
        <div className="bg-[#FFFFFF] pb-1.5 flex justify-center safe-area-bottom">
          <div className="w-32 h-1 bg-[#352F35]/20 rounded-full" />
        </div>
      </div>

      {/* Global AI Chat Modal */}
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
    </div>
  );
}
