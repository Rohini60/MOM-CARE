import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'hi';

export interface Translations {
  // Brand & Welcome
  appName: string;
  tagline: string;
  welcomeSubtitle: string;
  createAccount: string;
  login: string;
  judgesDemo: string;
  demoSubtitle: string;
  evidenceGrounded: string;
  privateSecure: string;
  triageProtocol: string;

  // Auth
  welcomeBack: string;
  createYourAccount: string;
  loginSubtitle: string;
  signupSubtitle: string;
  continueWithGoogle: string;
  orWithEmail: string;
  emailLabel: string;
  passwordLabel: string;
  confirmPasswordLabel: string;
  passwordsMustMatch: string;
  wrongCredentials: string;
  noAccountFound: string;
  noInternetNotice: string;
  forgotPassword: string;
  resetPasswordTitle: string;
  resetPasswordSubtitle: string;
  sendResetLink: string;
  backToLogin: string;
  resetSentNotice: string;
  loggingIn: string;
  creatingAccount: string;

  // Onboarding Step 1
  stepTitle: string;
  stepOf: string;
  welcomeToMomCare: string;
  step1Subtitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  nicknameLabel: string;
  nicknamePlaceholder: string;
  nicknameHelper: string;
  ageLabel: string;
  continueBtn: string;

  // Onboarding Step 2: Due Date & Pregnancy
  step2Title: string;
  step2Subtitle: string;
  dueDateLabel: string;
  notSureDueDate: string;
  pickCurrentWeek: string;
  currentWeekLabel: string;
  calculatedNotice: string;
  firstPregnancyLabel: string;
  firstPregnancyYes: string;
  firstPregnancyNo: string;
  babyNicknameLabel: string;
  babyNicknamePlaceholder: string;
  babyNicknameHelper: string;

  // Onboarding Step 3: Health History
  step3Title: string;
  step3Subtitle: string;
  preferNotToSay: string;
  conditionDiabetes: string;
  conditionBP: string;
  conditionAnemia: string;
  conditionThyroid: string;
  conditionComplications: string;
  conditionAllergies: string;
  conditionMedicines: string;
  allergiesPlaceholder: string;
  medicinesPlaceholder: string;

  // Onboarding Step 4: Emergency & Language
  step4Title: string;
  step4Subtitle: string;
  familyContactTitle: string;
  familyContactNamePlaceholder: string;
  familyContactPhonePlaceholder: string;
  doctorContactTitle: string;
  doctorNamePlaceholder: string;
  doctorPhonePlaceholder: string;
  emergencyHelper: string;
  preferredLanguageLabel: string;

  // Consent
  consentTitle: string;
  consentSubtitle: string;
  dataStoredTitle: string;
  dataStoredDesc: string;
  dataWhyTitle: string;
  dataWhyDesc: string;
  dataControlTitle: string;
  dataControlDesc: string;
  clinicalDisclaimerTitle: string;
  clinicalDisclaimerText: string;
  consentCheckbox: string;
  finishAndStart: string;
  settingUp: string;

  // Validation & Error Messages (Part 1 requirement)
  errNameMissing: string;
  errDueDateMissing: string;
  errDueDateInvalid: string;
  errSaveGeneral: string;
  retryBtn: string;

  // Home Screen
  goodMorning: string;
  weekWithBaby: string;
  yourBaby: string;
  noCheckinsYet: string;
  noCheckinsSub: string;
  dailyCheckinTitle: string;
  dailyCheckinSub: string;
  doneToday: string;
  overallFeeling: string;
  great: string;
  good: string;
  okay: string;
  tired: string;
  worried: string;
  discomfortQuestion: string;
  energyLevel: string;
  sleepQuality: string;
  babyMovement: string;
  movementNormal: string;
  movementLess: string;
  movementConcerned: string;
  symptomNotePlaceholder: string;
  saveDailyCheckin: string;
  savingCheckin: string;
  checkinSavedSuccess: string;
  safetyTriageBtn: string;
  medicalReportsBtn: string;
  askMomCareBtn: string;
  askMomCareDesc: string;

  // Triage & Emergency
  knowMyDate: string;
  symptomTriageTitle: string;
  symptomTriageSubtitle: string;
  protocolLevelsTitle: string;
  protocolRoutine: string;
  protocolRoutineDesc: string;
  protocolAttention: string;
  protocolAttentionDesc: string;
  protocolUrgent: string;
  protocolUrgentDesc: string;
  whatSymptomQuestion: string;
  symptomPlaceholder: string;
  severityLabel: string;
  severityMild: string;
  severityModerate: string;
  severitySevere: string;
  durationLabel: string;
  durationJustStarted: string;
  durationFewHours: string;
  duration1to2Days: string;
  durationOverWeek: string;
  locationLabel: string;
  assessBtn: string;
  assessingBtn: string;
  whatThisMeans: string;
  whatToDoNow: string;
  whenToContactDoctor: string;
  watchForSigns: string;
  evidenceSources: string;
  disclaimerText: string;
  redEmergencyTitle: string;
  redEmergencyMessage: string;
  callDoctorBtn: string;
  callAmbulanceBtn: string;
  callFamilyBtn: string;

  // Profile & Settings
  profileTitle: string;
  personalInfo: string;
  emergencyContactsTeam: string;
  healthBaselineTitle: string;
  saveChanges: string;
  savingChanges: string;
  savedSuccess: string;
  privacyDataControlTitle: string;
  privacyDataControlDesc: string;
  downloadMyData: string;
  deleteAccountData: string;
  deleteConfirmTitle: string;
  deleteConfirmDesc: string;
  deleteConfirmBtn: string;
  cancelBtn: string;
  logoutBtn: string;

  // Navigation
  navHome: string;
  navPregnancy: string;
  navCare: string;
  navCommunity: string;
  navProfile: string;

  // Personal AI Companion Home Redesign
  howAreYouToday: string;
  howAreYouSub: string;
  editCheckin: string;
  questionProgress: string;
  skipQuestion: string;
  checkinSummaryTitle: string;
  savedSuccessCheck: string;
  tryAgainBtn: string;
  personalAiInsightTitle: string;
  whyAmISeeingThis: string;
  dataUsedLabel: string;
  profileLearningLabel: string;
  profileLearningSub: string;
  trendSleep: string;
  trendEnergy: string;
  trendMovement: string;
  trendBetter: string;
  trendSame: string;
  trendLower: string;
  loadingInsightMsg1: string;
  loadingInsightMsg2: string;
  loadingInsightMsg3: string;
  todaysFocusTitle: string;
  todaysFocusCount: string;
  allTasksDone: string;
  smartNudgesTitle: string;
  nudgeCheckin: string;
  nudgeMovement: string;
  nudgeWater: string;
  nudgeAppt: string;
  knowYouBetterTitle: string;
  skipForNow: string;
  saveAnswer: string;
  askMomCareShortcutsTitle: string;
  askMomCareShortcutsSub: string;
  weeklySnapshotTitle: string;
  viewFullStory: string;
  homeDisclaimerNote: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    // Brand & Welcome
    appName: 'MomCare',
    tagline: 'Your safe companion through pregnancy',
    welcomeSubtitle: 'Stage-specific fetal insights, daily wellness tracking, and clinical safety triage for you and your baby.',
    createAccount: 'Create account',
    login: 'Log in',
    judgesDemo: 'Judges / demo access',
    demoSubtitle: 'Explore sample maternal data & evaluation scenarios',
    evidenceGrounded: '🌸 Evidence-grounded',
    privateSecure: '🔒 Private & Secure',
    triageProtocol: '🩺 Triage Protocol',

    // Auth
    welcomeBack: 'Welcome back to MomCare',
    createYourAccount: 'Create your account',
    loginSubtitle: 'Access your private maternal records',
    signupSubtitle: 'Your safe, personalized pregnancy companion',
    continueWithGoogle: 'Continue with Google',
    orWithEmail: 'Or with email',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    confirmPasswordLabel: 'Confirm Password',
    passwordsMustMatch: 'Passwords do not match. Please recheck.',
    wrongCredentials: 'Wrong email or password. Please try again.',
    noAccountFound: 'No account found with this email. Please create an account.',
    noInternetNotice: 'Unable to connect. Please check your internet connection and try again.',
    forgotPassword: 'Forgot password?',
    resetPasswordTitle: 'Reset your password',
    resetPasswordSubtitle: 'Enter your email to receive a password reset link',
    sendResetLink: 'Send reset link',
    backToLogin: 'Back to Log in',
    resetSentNotice: 'Password reset link sent to your email. Please check your inbox.',
    loggingIn: 'Logging in...',
    creatingAccount: 'Creating account...',

    // Onboarding Step 1
    stepTitle: 'Step',
    stepOf: 'of 4',
    welcomeToMomCare: 'Welcome to MomCare 💗',
    step1Subtitle: "Let's get to know you so your companion feels warm and personal.",
    fullNameLabel: 'Your Full Name',
    fullNamePlaceholder: 'e.g. Maya Sharma',
    nicknameLabel: 'What should we call you? (Preferred Name)',
    nicknamePlaceholder: 'e.g. Maya',
    nicknameHelper: 'Used for daily greetings, affirmations, and care check-ins.',
    ageLabel: 'Your Age (Optional)',
    continueBtn: 'Continue',

    // Onboarding Step 2: Due Date & Pregnancy
    step2Title: 'Your Pregnancy Journey 🌸',
    step2Subtitle: "Tell us your estimated due date so we can adapt to your baby's exact stage.",
    dueDateLabel: 'Estimated Due Date (Delivery Date)',
    notSureDueDate: "I'm not sure",
    pickCurrentWeek: "Select your current week (1 to 40)",
    currentWeekLabel: 'Current Gestational Week',
    calculatedNotice: 'Calculated Week',
    firstPregnancyLabel: 'Is this your first pregnancy?',
    firstPregnancyYes: 'Yes, first time',
    firstPregnancyNo: 'No, I have had prior',
    babyNicknameLabel: "Baby's Nickname (Optional)",
    babyNicknamePlaceholder: 'e.g. Little Peanut, Chinnu, Bean',
    babyNicknameHelper: "We'll use this nickname warmly across your daily updates.",

    // Onboarding Step 3: Health History
    step3Title: 'Health History (Optional) 🩺',
    step3Subtitle: 'Helps MomCare tailor warning sign triage. All information is strictly private.',
    preferNotToSay: 'Prefer not to share health history',
    conditionDiabetes: 'Gestational Diabetes or Diabetes',
    conditionBP: 'High Blood Pressure (Hypertension)',
    conditionAnemia: 'Anemia or Iron Deficiency',
    conditionThyroid: 'Thyroid Condition',
    conditionComplications: 'Previous Pregnancy Complications',
    conditionAllergies: 'Known Drug or Food Allergies',
    conditionMedicines: 'Currently taking daily prescription medicines',
    allergiesPlaceholder: 'e.g. Penicillin, Peanuts',
    medicinesPlaceholder: 'e.g. Thyroid medicine, Calcium, Iron',

    // Onboarding Step 4: Emergency & Language
    step4Title: 'Emergency Care & Language 🚨',
    step4Subtitle: 'These contacts power your one-touch emergency call button if acute symptoms appear.',
    familyContactTitle: '1. Family Member / Partner Contact',
    familyContactNamePlaceholder: 'Name (e.g. Husband, Sister)',
    familyContactPhonePlaceholder: 'Phone number',
    doctorContactTitle: '2. Doctor or Hospital Contact',
    doctorNamePlaceholder: 'Doctor / Clinic / Hospital Name',
    doctorPhonePlaceholder: 'Doctor / Hospital Phone',
    emergencyHelper: 'Used only if you press emergency help or when red-flag symptoms are detected.',
    preferredLanguageLabel: 'Preferred Language',

    // Consent
    consentTitle: 'Your Privacy & Consent 🔒',
    consentSubtitle: 'Transparency and peace of mind before we begin.',
    dataStoredTitle: 'What data is stored:',
    dataStoredDesc: 'Your pregnancy week, daily check-ins, symptom notes, and emergency contacts.',
    dataWhyTitle: 'Why we store it:',
    dataWhyDesc: 'To personalize your fetal progress, detect multi-day discomfort patterns, and enable immediate emergency calling.',
    dataControlTitle: 'Your complete control:',
    dataControlDesc: 'Your health data is strictly private and never sold. You can download or delete your data anytime from Settings.',
    clinicalDisclaimerTitle: 'Important Clinical Notice',
    clinicalDisclaimerText: 'MomCare gives information and early warnings. It does not diagnose. In an emergency, call your doctor or emergency services.',
    consentCheckbox: 'I understand what data is stored and agree to the privacy terms and clinical advisory.',
    finishAndStart: 'Finish & Start Journey 🌸',
    settingUp: 'Setting up your companion...',

    // Validation & Error Messages (Part 1)
    errNameMissing: 'Please tell us your name.',
    errDueDateMissing: "Please choose your due date, or tap 'I'm not sure'.",
    errDueDateInvalid: "That date doesn't look right. Please check it again.",
    errSaveGeneral: "We couldn't save your details. Please try again",
    retryBtn: 'Retry',

    // Home Screen
    goodMorning: 'Good morning',
    weekWithBaby: 'Week {week} with {baby}',
    yourBaby: 'your baby',
    noCheckinsYet: "No check-ins yet. Let's start today.",
    noCheckinsSub: 'Checking in takes 30 seconds and helps MomCare detect healthy patterns and early warning signs.',
    dailyCheckinTitle: 'Daily Metric & Discomfort Tracker',
    dailyCheckinSub: 'Feeds the ML pattern analysis engine',
    doneToday: 'Done Today',
    overallFeeling: 'Overall Feeling',
    great: 'Great',
    good: 'Good',
    okay: 'Okay',
    tired: 'Tired',
    worried: 'Worried',
    discomfortQuestion: 'Any specific discomfort locations today?',
    energyLevel: 'Energy Level',
    sleepQuality: 'Sleep Quality',
    babyMovement: 'Baby Movement',
    movementNormal: 'Active / Normal',
    movementLess: 'Less than usual',
    movementConcerned: 'Concerned',
    symptomNotePlaceholder: 'Optional notes: e.g. aching hips after walking, mild headache...',
    saveDailyCheckin: 'Save Daily Check-in',
    savingCheckin: 'Saving check-in...',
    checkinSavedSuccess: 'Check-in saved to your timeline!',
    safetyTriageBtn: 'Safety Triage',
    medicalReportsBtn: 'Medical Reports',
    askMomCareBtn: 'Ask MomCare',
    askMomCareDesc: 'MomCare AI remembers your week status, health conditions, and previous symptoms.',

    // Triage & Emergency (Hardcoded)
    knowMyDate: 'I know my date →',
    symptomTriageTitle: 'Safety Triage & Symptom Tracker',
    symptomTriageSubtitle: 'Evidence-based obstetric safety rules & personalized guidance',
    protocolLevelsTitle: 'Safety Triage Protocol Levels:',
    protocolRoutine: 'Routine',
    protocolRoutineDesc: 'Expected physiological symptom. Gentle comfort steps provided.',
    protocolAttention: 'Needs Attention',
    protocolAttentionDesc: 'Recurring or moderate symptom. Note pattern & review at appointment.',
    protocolUrgent: 'Urgent / Warning',
    protocolUrgentDesc: 'Severe red-flag sign. Immediate clinical assessment modal triggered.',
    whatSymptomQuestion: 'What symptom or sensation are you experiencing?',
    symptomPlaceholder: 'e.g., Lower back pain, morning nausea, headache...',
    severityLabel: 'Severity',
    severityMild: 'Mild',
    severityModerate: 'Moderate',
    severitySevere: 'Severe',
    durationLabel: 'Duration',
    durationJustStarted: 'Just started',
    durationFewHours: 'Few hours',
    duration1to2Days: '1-2 days',
    durationOverWeek: 'Over a week',
    locationLabel: 'Discomfort Location',
    assessBtn: 'Assess Symptom Safety',
    assessingBtn: 'Assessing with Clinical Rules...',
    whatThisMeans: 'What this means',
    whatToDoNow: 'What to do right now',
    whenToContactDoctor: 'When to contact your doctor',
    watchForSigns: 'Signs to watch for',
    evidenceSources: 'Clinical Guidelines & Sources',
    disclaimerText: 'MomCare gives evidence-based pregnancy information and early warnings. It does not diagnose. In an emergency, call your doctor or 108.',
    redEmergencyTitle: 'CRITICAL WARNING — IMMEDIATE ATTENTION NEEDED',
    redEmergencyMessage: 'Urgent medical attention is needed! Please call your doctor, hospital, or emergency ambulance (108) immediately without delay.',
    callDoctorBtn: 'Call Doctor / Clinic',
    callAmbulanceBtn: 'Call Emergency 108',
    callFamilyBtn: 'Call Family Contact',

    // Profile & Settings
    profileTitle: 'Profile & Settings',
    personalInfo: 'Personal Information',
    emergencyContactsTeam: 'Emergency Contacts & Care Team',
    healthBaselineTitle: 'Tracked Health Baseline',
    saveChanges: 'Save Profile Changes',
    savingChanges: 'Saving changes...',
    savedSuccess: 'Saved successfully!',
    privacyDataControlTitle: 'Your Data & Privacy Control',
    privacyDataControlDesc: 'You have full ownership of your records. You can download a complete backup or permanently delete all your data.',
    downloadMyData: 'Download My Data (.JSON)',
    deleteAccountData: 'Delete Account & Data',
    deleteConfirmTitle: 'Permanently Delete Account?',
    deleteConfirmDesc: 'This will irreversibly remove all your daily check-ins, symptom reports, and private records from the database.',
    deleteConfirmBtn: 'Yes, Delete All',
    cancelBtn: 'Cancel',
    logoutBtn: 'Log out',

    // Navigation
    navHome: 'Home',
    navPregnancy: 'Womb',
    navCare: 'Care',
    navCommunity: 'Circle',
    navProfile: 'Profile',

    // Personal AI Companion Home Redesign
    howAreYouToday: 'How are you feeling today?',
    howAreYouSub: 'A quick 30-second check helps MomCare watch over you and baby.',
    editCheckin: 'Edit check-in',
    questionProgress: 'Question {current} of {total}',
    skipQuestion: 'Skip',
    checkinSummaryTitle: 'Your check-in summary',
    savedSuccessCheck: 'Saved ✓',
    tryAgainBtn: 'Try again',
    personalAiInsightTitle: 'MomCare Personal Insight',
    whyAmISeeingThis: 'Why am I seeing this?',
    dataUsedLabel: 'Data used:',
    profileLearningLabel: '{days} of 7 days logged',
    profileLearningSub: 'Your profile gets smarter and more personal as you log.',
    trendSleep: 'Sleep',
    trendEnergy: 'Energy',
    trendMovement: 'Baby kicks',
    trendBetter: 'better',
    trendSame: 'steady',
    trendLower: 'lower',
    loadingInsightMsg1: 'Looking at your last 7 days...',
    loadingInsightMsg2: 'Checking your sleep and energy...',
    loadingInsightMsg3: 'Preparing your personal tips...',
    todaysFocusTitle: "Today's Focus",
    todaysFocusCount: '{completed} of 3 done',
    allTasksDone: 'All done for today! Great job taking care of yourself 🌸',
    smartNudgesTitle: 'Gentle Reminders',
    nudgeCheckin: "You haven't checked in yet today. A 30-second tap helps MomCare watch over you.",
    nudgeMovement: 'Past week 28: Have you noticed baby’s active kicks today? Take a quiet moment on your side.',
    nudgeWater: 'Stay hydrated: have a fresh glass of water right now.',
    nudgeAppt: 'Upcoming prenatal checkup: remember to write down any questions you have for your doctor.',
    knowYouBetterTitle: 'Help us know you better',
    skipForNow: 'Skip for now',
    saveAnswer: 'Save',
    askMomCareShortcutsTitle: 'Ask MomCare',
    askMomCareShortcutsSub: 'Tap any question to ask your AI companion directly:',
    weeklySnapshotTitle: 'Weekly Milestone Snapshot',
    viewFullStory: 'View full week details →',
    homeDisclaimerNote: 'MomCare gives information and early warnings. It does not diagnose. In an emergency, call your doctor or 108.',
  },

  ta: {
    // Brand & Welcome (எளிய தமிழ்)
    appName: 'மாம்கேர் (MomCare)',
    tagline: 'கர்ப்ப காலத்தில் உங்கள் பாதுகாப்பான துணை',
    welcomeSubtitle: 'குழந்தையின் வாராந்திர வளர்ச்சி, தினசரி நலப் பதிவு, மற்றும் மருத்துவ எச்சரிக்கை வழிகாட்டுதல்.',
    createAccount: 'புதிய கணக்கு தொடங்க',
    login: 'உள்நுழைய',
    judgesDemo: 'மாதிரி பார்வை (Demo)',
    demoSubtitle: 'மாதிரி தகவல்கள் மற்றும் மதிப்பீட்டு காட்சிகளை பார்க்க',
    evidenceGrounded: '🌸 மருத்துவ வழிகாட்டுதல்',
    privateSecure: '🔒 முழு பாதுகாப்பு',
    triageProtocol: '🩺 அவசர உதவி முறை',

    // Auth
    welcomeBack: 'மீண்டும் நல்வரவு!',
    createYourAccount: 'உங்கள் கணக்கை தொடங்கவும்',
    loginSubtitle: 'உங்கள் பாதுகாப்பான கர்ப்ப குறிப்புகளை பார்க்க',
    signupSubtitle: 'உங்களுக்கும் உங்கள் குழந்தைக்கும் அன்பான துணை',
    continueWithGoogle: 'கூகிள் (Google) மூலம் தொடர',
    orWithEmail: 'அல்லது மின்னஞ்சல் மூலம்',
    emailLabel: 'மின்னஞ்சல் (Email)',
    passwordLabel: 'கடவுச்சொல் (Password)',
    confirmPasswordLabel: 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும் (Confirm Password)',
    passwordsMustMatch: 'கடவுச்சொற்கள் பொருந்தவில்லை. மீண்டும் சரிபார்க்கவும்.',
    wrongCredentials: 'தவறான மின்னஞ்சல் அல்லது கடவுச்சொல். மீண்டும் முயற்சிக்கவும்.',
    noAccountFound: 'இந்த மின்னஞ்சலில் கணக்கு இல்லை. புதிய கணக்கு தொடங்கவும்.',
    noInternetNotice: 'இணைய இணைப்பு கிடைக்கவில்லை. இணையத்தை சரிபார்த்து மீண்டும் முயற்சிக்கவும்.',
    forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
    resetPasswordTitle: 'கடவுச்சொல்லை மாற்ற',
    resetPasswordSubtitle: 'உங்கள் மின்னஞ்சலை பதிவு செய்யவும்',
    sendResetLink: 'இணைப்பு அனுப்பவும்',
    backToLogin: 'உள்நுழைவுக்கு திரும்புக',
    resetSentNotice: 'கடவுச்சொல் மாற்றும் இணைப்பு உங்கள் மின்னஞ்சலுக்கு அனுப்பப்பட்டது.',
    loggingIn: 'உள்நுழைகிறது...',
    creatingAccount: 'கணக்கு உருவாகிறது...',

    // Onboarding Step 1
    stepTitle: 'படி',
    stepOf: 'மொத்தம் 4-ல்',
    welcomeToMomCare: 'மாம்கேர்-க்கு நல்வரவு 💗',
    step1Subtitle: 'உங்களைப்பற்றி தெரிந்து கொள்ள சில எளிய விவரங்கள்.',
    fullNameLabel: 'உங்கள் முழுப் பெயர்',
    fullNamePlaceholder: 'எ.கா. பிரியா',
    nicknameLabel: 'உங்களை எப்படி அழைக்கலாம்? (செல்லப் பெயர்)',
    nicknamePlaceholder: 'எ.கா. பிரியா',
    nicknameHelper: 'தினசரி காலை வாழ்த்துகள் மற்றும் அன்பான நினைவூட்டல்களுக்கு இது பயன்படும்.',
    ageLabel: 'உங்கள் வயது (விருப்பப்பட்டால்)',
    continueBtn: 'தொடரவும்',

    // Onboarding Step 2: Due Date & Pregnancy
    step2Title: 'உங்கள் கர்ப்பப் பயணம் 🌸',
    step2Subtitle: 'குழந்தையின் வளர்ச்சியை சரியாக கணிக்க உங்கள் பிரசவ தேதியை குறிப்பிடவும்.',
    dueDateLabel: 'பிரசவ தேதி (டெலிவரி தேதி)',
    notSureDueDate: 'எனக்கு தேதி சரியாக தெரியவில்லை',
    pickCurrentWeek: 'உங்கள் தற்போதைய வாரத்தை தேர்வு செய்யவும் (1 முதல் 40)',
    currentWeekLabel: 'தற்போதைய கர்ப்ப வாரம்',
    calculatedNotice: 'கணக்கிடப்பட்ட வாரம்',
    firstPregnancyLabel: 'இது உங்கள் முதல் கர்ப்பமா?',
    firstPregnancyYes: 'ஆம், முதல் முறை',
    firstPregnancyNo: 'இல்லை, ஏற்கனவே குழந்தைகள் உண்டு',
    babyNicknameLabel: 'குழந்தையின் செல்லப் பெயர் (விருப்பப்பட்டால்)',
    babyNicknamePlaceholder: 'எ.கா. கண்ணா, பாப்பா, பட்டு',
    babyNicknameHelper: 'குழந்தையின் படங்களிலும் நினைவூட்டல்களிலும் இந்த பெயரை அன்புடன் பயன்படுத்துவோம்.',

    // Onboarding Step 3: Health History
    step3Title: 'உடல் நலம் & மருத்துவ விவரங்கள் (விருப்பப்பட்டால்) 🩺',
    step3Subtitle: 'சரியான எச்சரிக்கைகளை வழங்க இது உதவும். உங்கள் தகவல்கள் முற்றிலும் ரகசியமாக வைக்கப்படும்.',
    preferNotToSay: 'இப்போது சொல்ல விருப்பமில்லை',
    conditionDiabetes: 'சர்க்கரை நோய் (Gestational Diabetes)',
    conditionBP: 'ரத்த அழுத்தம் (BP / Hypertension)',
    conditionAnemia: 'ரத்த சோகை (Anemia / இரும்புச்சத்து குறைபாடு)',
    conditionThyroid: 'தைராய்டு (Thyroid)',
    conditionComplications: 'முந்தைய கர்ப்பத்தில் ஏதேனும் சிக்கல்கள்',
    conditionAllergies: 'மருந்து அல்லது உணவு அலர்ஜி',
    conditionMedicines: 'தினசரி எடுத்துக்கொள்ளும் மாத்திரைகள்',
    allergiesPlaceholder: 'எ.கா. பென்சிலின், நிலக்கடலை',
    medicinesPlaceholder: 'எ.கா. தைராய்டு மாத்திரை, இரும்புச்சத்து மாத்திரை',

    // Onboarding Step 4: Emergency & Language
    step4Title: 'அவசர உதவி எண்கள் & மொழி 🚨',
    step4Subtitle: 'திடீர் வலி அல்லது உடல் உபாதை ஏற்பட்டால் உடனடியாக அழைக்க இந்த எண்கள் பயன்படும்.',
    familyContactTitle: '1. குடும்பத்தினர் / கணவர் எண்',
    familyContactNamePlaceholder: 'பெயர் (எ.கா. கணவர், அம்மா)',
    familyContactPhonePlaceholder: 'தொலைபேசி எண்',
    doctorContactTitle: '2. மருத்துவர் அல்லது மருத்துவமனை எண்',
    doctorNamePlaceholder: 'மருத்துவர் அல்லது மருத்துவமனை பெயர்',
    doctorPhonePlaceholder: 'மருத்துவமனை தொலைபேசி எண்',
    emergencyHelper: 'அவசர உதவி பட்டனை அழுத்தும்போது மட்டுமே இந்த எண்கள் அழைக்கப்படும்.',
    preferredLanguageLabel: 'விருப்பமான மொழி',

    // Consent
    consentTitle: 'உங்கள் பாதுகாப்பு மற்றும் ஒப்புதல் 🔒',
    consentSubtitle: 'தொடங்குவதற்கு முன் சில முக்கிய விவரங்கள்.',
    dataStoredTitle: 'நாங்கள் என்ன தகவல்களை சேமிக்கிறோம்:',
    dataStoredDesc: 'கர்ப்ப வாரம், தினசரி நலப் பதிவுகள், மற்றும் அவசர தொடர்பு எண்கள் மட்டுமே.',
    dataWhyTitle: 'எதற்காக சேமிக்கிறோம்:',
    dataWhyDesc: 'குழந்தையின் வளர்ச்சியை கண்காணிக்கவும், ஏதேனும் அசாதாரண மாற்றங்களை முன்கூட்டியே எச்சரிக்கவும்.',
    dataControlTitle: 'உங்கள் முழு உரிமை:',
    dataControlDesc: 'உங்கள் தகவல்கள் எவருக்கும் விற்கப்படாது. நீங்கள் எப்போது வேண்டுமானாலும் உங்கள் கணக்கையும் தகவல்களையும் அழித்துவிடலாம்.',
    clinicalDisclaimerTitle: 'முக்கிய மருத்துவ அறிவிப்பு',
    clinicalDisclaimerText: 'மாம்கேர் (MomCare) உங்களுக்கு தகவல்களையும் ஆரம்ப எச்சரிக்கைகளையும் மட்டுமே வழங்கும். இது மருத்துவரின் நோயறிதல் அல்ல. அவசர காலத்தில் உடனே உங்கள் மருத்துவரை அல்லது அவசர பிரிவை அழைக்கவும்.',
    consentCheckbox: 'மேலே உள்ள தகவல்களை புரிந்து கொண்டேன் மற்றும் விதிமுறைகளை ஒப்புக்கொள்கிறேன்.',
    finishAndStart: 'பயணத்தை தொடங்கலாம் 🌸',
    settingUp: 'தயாராகிறது...',

    // Validation & Error Messages (Part 1)
    errNameMissing: 'தயவுசெய்து உங்கள் பெயரை எழுதவும்.',
    errDueDateMissing: "தயவுசெய்து உங்கள் பிரசவ தேதியை குறிப்பிடவும், அல்லது 'தெரியவில்லை' என்பதை அழுத்தவும்.",
    errDueDateInvalid: 'இந்த தேதி சரியாக தெரியவில்லை. தயவுசெய்து மீண்டும் சரிபார்க்கவும்.',
    errSaveGeneral: 'விவரங்களை சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    retryBtn: 'மீண்டும் முயற்சிக்கவும்',

    // Home Screen
    goodMorning: 'காலை வணக்கம்',
    weekWithBaby: '{week}-வது வாரம், {baby}-உடன்',
    yourBaby: 'உங்கள் குழந்தை',
    noCheckinsYet: 'இன்னும் பதிவுகள் இல்லை. இன்றே தொடங்குங்கள்!',
    noCheckinsSub: 'பதிவு செய்ய 30 வினாடிகளே ஆகும். இது உங்களுக்கும் குழந்தைக்கும் ஆரோக்கியமான பழக்கங்களை உருவாக்கும்.',
    dailyCheckinTitle: 'இன்றைய நலப் பதிவு',
    dailyCheckinSub: 'உடல் ஆரோக்கியத்தை கண்காணிக்க உதவுகிறது',
    doneToday: 'இன்று முடிந்தது',
    overallFeeling: 'இன்று உங்கள் உடல்நிலை எப்படி உள்ளது?',
    great: 'மிக நன்று',
    good: 'நன்று',
    okay: 'பரவாயில்லை',
    tired: 'சோர்வு',
    worried: 'கவலை',
    discomfortQuestion: 'இன்று ஏதேனும் வலி அல்லது அசௌகரியம் உள்ளதா?',
    energyLevel: 'உடல் புத்துணர்ச்சி',
    sleepQuality: 'தூக்கத்தின் அளவு',
    babyMovement: 'குழந்தையின் அசைவு',
    movementNormal: 'இயல்பாக உள்ளது',
    movementLess: 'அசைவு குறைவு',
    movementConcerned: 'பயமாயிருக்கிறது',
    symptomNotePlaceholder: 'குறிப்புகள்: எ.கா. இடுப்பு வலி, லேசான தலைவலி...',
    saveDailyCheckin: 'இன்றைய பதிவை சேமிக்க',
    savingCheckin: 'சேமிக்கப்படுகிறது...',
    checkinSavedSuccess: 'பதிவு வெற்றிகரமாக சேமிக்கப்பட்டது!',
    safetyTriageBtn: 'அவசர பரிசோதனை',
    medicalReportsBtn: 'ஸ்கேன் அறிக்கைகள்',
    askMomCareBtn: 'மாம்கேர் கேள்வி',
    askMomCareDesc: 'உங்கள் கர்ப்ப வாரம் மற்றும் ஆரோக்கிய நிலைக்கு ஏற்ப விளக்கம் தருகிறது.',

    // Triage & Emergency (Hardcoded)
    knowMyDate: 'தேதி தெரியும் →',
    symptomTriageTitle: 'பாதுகாப்பு & அறிகுறிகள் சோதனை',
    symptomTriageSubtitle: 'மருத்துவப் பாதுகாப்பு வழிகாட்டுதல்கள் மற்றும் ஆலோசனைகள்',
    protocolLevelsTitle: 'பாதுகாப்பு நிலைகள்:',
    protocolRoutine: 'சாதாரணமானது',
    protocolRoutineDesc: 'கர்ப்ப காலத்தில் வழக்கமாக வருவது. எளிய ஓய்வு மற்றும் வீட்டுப் பராமரிப்பு.',
    protocolAttention: 'கவனிக்க வேண்டியது',
    protocolAttentionDesc: 'தொடர்ந்து வரும் அறிகுறி. அடுத்த மருத்துவ பரிசோதனையில் கூறவும்.',
    protocolUrgent: 'அவசர எச்சரிக்கை',
    protocolUrgentDesc: 'உடனடி மருத்துவ ஆலோசனை அல்லது அவசர சிகிச்சை தேவை.',
    whatSymptomQuestion: 'உடலில் என்ன உணர்கிறீர்கள்?',
    symptomPlaceholder: 'எ.கா. முதுகு வலி, காலை மயக்கம், தலைவலி...',
    severityLabel: 'தீவிரம்',
    severityMild: 'லேசானது',
    severityModerate: 'மிதமானது',
    severitySevere: 'அதிகமானது',
    durationLabel: 'எவ்வளவு நேரமாக?',
    durationJustStarted: 'இப்போதுதான் ஆரம்பித்தது',
    durationFewHours: 'சில மணிநேரமாக',
    duration1to2Days: '1-2 நாட்களாக',
    durationOverWeek: 'ஒரு வாரத்திற்கு மேலாக',
    locationLabel: 'உடலின் எந்த பகுதி?',
    assessBtn: 'அறிகுறியை சோதிக்கவும்',
    assessingBtn: 'சோதிக்கப்படுகிறது...',
    whatThisMeans: 'இதன் பொருள் என்ன?',
    whatToDoNow: 'இப்போது என்ன செய்ய வேண்டும்?',
    whenToContactDoctor: 'எப்போது மருத்துவரை அழைக்க வேண்டும்?',
    watchForSigns: 'கவனிக்க வேண்டிய அபாய அறிகுறிகள்',
    evidenceSources: 'மருத்துவ வழிகாட்டுதல் ஆதாரங்கள்',
    disclaimerText: 'மாம்கேர் (MomCare) விழிப்புணர்வுக்காக மட்டுமே. இது மருத்துவரின் நேரடி பரிசோதனைக்கு மாற்றாகாது. அவசர நிலையில் உடனே மருத்துவரை அழைக்கவும்.',
    redEmergencyTitle: 'அவசர எச்சரிக்கை — உடனடி கவனிப்பு தேவை!',
    redEmergencyMessage: 'உடனடி மருத்துவ உதவி தேவைப்படுகிறது! தாமதிக்காமல் உடனே உங்கள் மருத்துவரை அழைக்கவும் அல்லது 108 அவசர ஊர்தியை அழைக்கவும்.',
    callDoctorBtn: 'மருத்துவரை அழைக்கவும்',
    callAmbulanceBtn: '108 ஆம்புலன்ஸ் அழைக்க',
    callFamilyBtn: 'குடும்பத்தினரை அழைக்க',

    // Profile & Settings
    profileTitle: 'சுயவிவரம் & அமைப்புகள்',
    personalInfo: 'தனிப்பட்ட விவரங்கள்',
    emergencyContactsTeam: 'அவசர உதவி எண்கள்',
    healthBaselineTitle: 'உடல்நலக் குறிப்புகள்',
    saveChanges: 'மாற்றங்களை சேமிக்கவும்',
    savingChanges: 'சேமிக்கப்படுகிறது...',
    savedSuccess: 'வெற்றிகரமாக சேமிக்கப்பட்டது!',
    privacyDataControlTitle: 'உங்கள் தகவல்களின் பாதுகாப்பு',
    privacyDataControlDesc: 'உங்கள் தகவல்களுக்கு நீங்களே முழு உரிமையாளர். உங்கள் தகவல்களை நீங்கள் தரவிறக்கம் செய்யலாம் அல்லது நிரந்தரமாக அழிக்கலாம்.',
    downloadMyData: 'என் தகவல்களை பதிவிறக்க (.JSON)',
    deleteAccountData: 'கணக்கை நிரந்தரமாக நீக்க',
    deleteConfirmTitle: 'கணக்கை முற்றிலும் நீக்க வேண்டுமா?',
    deleteConfirmDesc: 'இது உங்கள் எல்லா பதிவுகளையும் நிரந்தரமாக அழித்துவிடும். மீண்டும் பெற முடியாது.',
    deleteConfirmBtn: 'ஆம், முற்றிலும் நீக்கு',
    cancelBtn: 'ரத்து செய்',
    logoutBtn: 'வெளியேறு (Log out)',

    // Navigation
    navHome: 'முகப்பு',
    navPregnancy: 'கருவறை',
    navCare: 'பராமரிப்பு',
    navCommunity: 'வட்டம்',
    navProfile: 'சுயவிவரம்',

    // Personal AI Companion Home Redesign
    howAreYouToday: 'இன்று உங்கள் உடல்நிலை எப்படி இருக்கிறது?',
    howAreYouSub: 'ஒரு நிமிடப் பதிவு உங்களையும் பாப்பாவையும் கவனமாகப் பார்த்துக் கொள்ள உதவும்.',
    editCheckin: 'பதிவை மாற்ற ✏️',
    questionProgress: 'கேள்வி {current} / {total}',
    skipQuestion: 'தவிர்',
    checkinSummaryTitle: 'இன்றைய பதிவின் சுருக்கம்',
    savedSuccessCheck: 'சேமிக்கப்பட்டது ✓',
    tryAgainBtn: 'மீண்டும் முயற்சிக்க',
    personalAiInsightTitle: 'மாம்கேர் தனிப்பட்ட ஆலோசனை',
    whyAmISeeingThis: 'இதை நான் ஏன் பார்க்கிறேன்?',
    dataUsedLabel: 'பயன்படுத்திய விவரம்:',
    profileLearningLabel: '7 நாட்களில் {days} நாட்கள் பதிவாகியுள்ளது',
    profileLearningSub: 'தொடர்ந்து நீங்கள் பதிவு செய்ய செய்ய ஆலோசனைகள் இன்னும் துல்லியமாகும்.',
    trendSleep: 'தூக்கம்',
    trendEnergy: 'உடல் தெம்பு',
    trendMovement: 'குழந்தையின் அசைவு',
    trendBetter: 'மேம்பட்டுள்ளது ↑',
    trendSame: 'சமமாக உள்ளது →',
    trendLower: 'சற்றே குறைவு ↓',
    loadingInsightMsg1: 'கடந்த 7 நாட்களின் பதிவுகளைப் பார்க்கிறோம்...',
    loadingInsightMsg2: 'உங்கள் தூக்கம் மற்றும் சோர்வை சரிபார்க்கிறோம்...',
    loadingInsightMsg3: 'உங்களுக்கான தனிப்பட்ட குறிப்புகளைத் தயார் செய்கிறோம்...',
    todaysFocusTitle: 'இன்றைய முக்கிய கவனிப்பு',
    todaysFocusCount: '3-ல் {completed} முடிந்தது',
    allTasksDone: 'இன்றைய குறிப்புகள் அனைத்தும் முடிந்தது! உங்கள் உடலை அருமையாக கவனிக்கிறீர்கள் 🌸',
    smartNudgesTitle: 'அன்பான நினைவூட்டல்',
    nudgeCheckin: 'இன்று நீங்கள் இன்னும் பதிவு செய்யவில்லை. 30 வினாடிகளில் பதிவு செய்து விடுங்கள்.',
    nudgeMovement: '28 வாரங்களுக்குப் பிறகு: இன்று குழந்தையின் சுறுசுறுப்பான உதைகளை கவனித்தீர்களா?',
    nudgeWater: 'தண்ணீர் தாகம் தீர இப்போது ஒரு டம்ளர் தூய தண்ணீர் குடியுங்கள்.',
    nudgeAppt: 'அடுத்த மருத்துவ பரிசோதனைக்கு கேட்க வேண்டிய கேள்விகளை குறித்து வையுங்கள்.',
    knowYouBetterTitle: 'உங்களை இன்னும் நன்றாகப் புரிந்து கொள்ள',
    skipForNow: 'பிறகு செய்கிறேன்',
    saveAnswer: 'சேமி',
    askMomCareShortcutsTitle: 'மாம்கேரிடம் கேளுங்கள்',
    askMomCareShortcutsSub: 'உங்களுக்காகத் தொகுக்கப்பட்ட கேள்விகள் (தட்டிப் பாருங்கள்):',
    weeklySnapshotTitle: 'வாராந்திர வளர்ச்சிப் பார்வை',
    viewFullStory: 'முழு விவரங்களைப் பார்க்க →',
    homeDisclaimerNote: 'மாம்கேர் வழிகாட்டுதலையும் ஆரம்ப எச்சரிக்கையையும் மட்டுமே தருகிறது. இது மருத்துவப் பரிசோதனை அல்ல.',
  },

  hi: {
    // Brand & Welcome (सरल हिन्दी)
    appName: 'मॉमकेयर (MomCare)',
    tagline: 'गर्भावस्था में आपकी सुरक्षित साथी',
    welcomeSubtitle: 'शिशु के विकास की हर हफ्ते की जानकारी, दैनिक सेहत की देखभाल, और सुरक्षित मार्गदर्शन।',
    createAccount: 'नया खाता बनाएं',
    login: 'लॉग इन करें',
    judgesDemo: 'डेमो देखें (Demo)',
    demoSubtitle: 'नमूना डेटा और मूल्यांकन के लिए देखें',
    evidenceGrounded: '🌸 डॉक्टर द्वारा प्रमाणित',
    privateSecure: '🔒 पूरी तरह सुरक्षित',
    triageProtocol: '🩺 आपातकालीन सुरक्षा',

    // Auth
    welcomeBack: 'वापसी पर स्वागत है!',
    createYourAccount: 'अपना खाता बनाएं',
    loginSubtitle: 'अपनी सुरक्षित गर्भावस्था रिपोर्ट देखने के लिए',
    signupSubtitle: 'आपके और आपके नन्हे शिशु की देखभाल के लिए',
    continueWithGoogle: 'गूगल (Google) से आगे बढ़ें',
    orWithEmail: 'या ईमेल से',
    emailLabel: 'ईमेल (Email)',
    passwordLabel: 'पासवर्ड (Password)',
    confirmPasswordLabel: 'पासवर्ड दोबारा दर्ज करें (Confirm Password)',
    passwordsMustMatch: 'पासवर्ड मेल नहीं खा रहे हैं। कृपया दोबारा जांचें।',
    wrongCredentials: 'गलत ईमेल या पासवर्ड। कृपया पुनः प्रयास करें।',
    noAccountFound: 'इस ईमेल से कोई खाता नहीं मिला। कृपया नया खाता बनाएं।',
    noInternetNotice: 'इंटरनेट कनेक्शन नहीं है। कृपया नेटवर्क जांचकर पुनः प्रयास करें।',
    forgotPassword: 'पासवर्ड भूल गए?',
    resetPasswordTitle: 'पासवर्ड रीसेट करें',
    resetPasswordSubtitle: 'अपना ईमेल दर्ज करें',
    sendResetLink: 'लिंक भेजें',
    backToLogin: 'लॉग इन पर वापस जाएं',
    resetSentNotice: 'पासवर्ड रीसेट करने का लिंक आपके ईमेल पर भेज दिया गया है।',
    loggingIn: 'लॉग इन हो रहा है...',
    creatingAccount: 'खाता बन रहा है...',

    // Onboarding Step 1
    stepTitle: 'कदम',
    stepOf: '4 में से',
    welcomeToMomCare: 'मॉमकेयर में आपका स्वागत है 💗',
    step1Subtitle: 'आइए आपके बारे में कुछ बातें जानें ताकि हम आपकी सही देखभाल कर सकें।',
    fullNameLabel: 'आपका पूरा नाम',
    fullNamePlaceholder: 'उदा. प्रिया शर्मा',
    nicknameLabel: 'हम आपको क्या कहकर बुलाएं? (प्यारा नाम)',
    nicknamePlaceholder: 'उदा. प्रिया',
    nicknameHelper: 'रोजाना के संदेशों और बातचीत में यह नाम उपयोग होगा।',
    ageLabel: 'आपकी उम्र (ऐच्छिक)',
    continueBtn: 'आगे बढ़ें',

    // Onboarding Step 2: Due Date & Pregnancy
    step2Title: 'आपकी गर्भावस्था का सफर 🌸',
    step2Subtitle: 'डिलीवरी की अनुमानित तारीख बताएं ताकि हम शिशु के विकास की सही जानकारी दे सकें।',
    dueDateLabel: 'प्रसव की तारीख (डिलीवरी डेट)',
    notSureDueDate: 'मुझे पक्का नहीं पता',
    pickCurrentWeek: 'अपना मौजूदा हफ्ता चुनें (1 से 40)',
    currentWeekLabel: 'मौजूदा गर्भावस्था का हफ्ता',
    calculatedNotice: 'निकाला गया हफ्ता',
    firstPregnancyLabel: 'क्या यह आपकी पहली गर्भावस्था है?',
    firstPregnancyYes: 'हाँ, पहली बार',
    firstPregnancyNo: 'नहीं, पहले भी बच्चे हैं',
    babyNicknameLabel: 'शिशु का प्यारा नाम (ऐच्छिक)',
    babyNicknamePlaceholder: 'उदा. लल्ला, नन्हा, कान्हा, गुड़िया',
    babyNicknameHelper: 'हम इस नाम का उपयोग शिशु की तस्वीरों और संदेशों में करेंगे।',

    // Onboarding Step 3: Health History
    step3Title: 'स्वास्थ्य और सेहत की जानकारी (ऐच्छिक) 🩺',
    step3Subtitle: 'इससे मॉमकेयर आपको सही समय पर सावधानी बरतने की सलाह दे सकेगा। आपकी जानकारी पूरी तरह गोपनीय है।',
    preferNotToSay: 'अभी नहीं बताना चाहती',
    conditionDiabetes: 'शुगर / मधुमेह (Gestational Diabetes)',
    conditionBP: 'ब्लड प्रेशर / बीपी (High BP)',
    conditionAnemia: 'खून की कमी / एनीमिया (Anemia)',
    conditionThyroid: 'थायराइड (Thyroid)',
    conditionComplications: 'पिछली गर्भावस्था में कोई समस्या',
    conditionAllergies: 'किसी दवा या खाने से एलर्जी',
    conditionMedicines: 'रोजाना ली जाने वाली दवाइयाँ',
    allergiesPlaceholder: 'उदा. पेनिसिलिन, मूंगफली',
    medicinesPlaceholder: 'उदा. थायराइड की गोली, कैल्शियम, आयरन',

    // Onboarding Step 4: Emergency & Language
    step4Title: 'आपातकालीन नंबर और भाषा 🚨',
    step4Subtitle: 'अचानक कोई तकलीफ होने पर एक क्लिक में संपर्क करने के लिए ये नंबर जरूरी हैं।',
    familyContactTitle: '1. परिवार / पति का फोन नंबर',
    familyContactNamePlaceholder: 'नाम (उदा. पति, माँ, दीदी)',
    familyContactPhonePlaceholder: 'फोन नंबर',
    doctorContactTitle: '2. डॉक्टर या अस्पताल का नंबर',
    doctorNamePlaceholder: 'डॉक्टर या अस्पताल का नाम',
    doctorPhonePlaceholder: 'अस्पताल का फोन नंबर',
    emergencyHelper: 'इमरजेंसी बटन दबाने पर सीधे इन नंबरों पर कॉल किया जा सकेगा।',
    preferredLanguageLabel: 'पसंदीदा भाषा',

    // Consent
    consentTitle: 'आपकी गोपनीयता और सहमति 🔒',
    consentSubtitle: 'शुरुआत करने से पहले कुछ जरूरी बातें।',
    dataStoredTitle: 'हम क्या जानकारी रखते हैं:',
    dataStoredDesc: 'गर्भावस्था का हफ्ता, दैनिक जांच रिपोर्ट, और आपातकालीन नंबर।',
    dataWhyTitle: 'हम यह क्यों रखते हैं:',
    dataWhyDesc: 'शिशु के विकास पर नजर रखने और किसी भी खतरे से पहले आपको सचेत करने के लिए।',
    dataControlTitle: 'आपका पूरा अधिकार:',
    dataControlDesc: 'आपकी सेहत की जानकारी कभी किसी को नहीं बेची जाएगी। आप कभी भी अपना डेटा हटा या मिटा सकती हैं।',
    clinicalDisclaimerTitle: 'जरूरी चिकित्सकीय सूचना',
    clinicalDisclaimerText: 'मॉमकेयर (MomCare) केवल जानकारी और शुरुआती चेतावनी देता है। यह डॉक्टर की जांच या इलाज का विकल्प नहीं है। आपात स्थिति में तुरंत डॉक्टर या आपातकालीन सेवा से संपर्क करें।',
    consentCheckbox: 'मैंने यह जानकारी पढ़ ली है और मैं इन शर्तों से सहमत हूँ।',
    finishAndStart: 'शुरुआत करें 🌸',
    settingUp: 'तैयारी हो रही है...',

    // Validation & Error Messages (Part 1)
    errNameMissing: 'कृपया अपना नाम बताएं।',
    errDueDateMissing: "कृपया डिलीवरी की तारीख चुनें, या 'मुझे नहीं पता' पर टैप करें।",
    errDueDateInvalid: 'यह तारीख सही नहीं लग रही है। कृपया दोबारा जांचें।',
    errSaveGeneral: 'हम आपकी जानकारी सुरक्षित नहीं कर सके। कृपया दोबारा कोशिश करें।',
    retryBtn: 'दोबारा कोशिश करें',

    // Home Screen
    goodMorning: 'सुप्रभात',
    weekWithBaby: 'हफ्ता {week}, {baby} के साथ',
    yourBaby: 'आपका शिशु',
    noCheckinsYet: 'अभी कोई चेक-इन नहीं है। आज से शुरुआत करें!',
    noCheckinsSub: 'इसमें सिर्फ 30 सेकंड लगते हैं और इससे आपके और बच्चे के स्वास्थ्य की निगरानी होती है।',
    dailyCheckinTitle: 'आज की सेहत की जांच',
    dailyCheckinSub: 'आपकी सेहत के पैटर्न को समझने में मदद करता है',
    doneToday: 'आज का पूरा हुआ',
    overallFeeling: 'आज आप कैसा महसूस कर रही हैं?',
    great: 'बहुत अच्छा',
    good: 'अच्छा',
    okay: 'ठीक-ठाक',
    tired: 'थकान',
    worried: 'चिंता',
    discomfortQuestion: 'क्या आज शरीर में कहीं दर्द या असहजता है?',
    energyLevel: 'शरीर में ऊर्जा',
    sleepQuality: 'नींद कैसी रही',
    babyMovement: 'शिशु की हलचल',
    movementNormal: 'सामान्य / सक्रिय',
    movementLess: 'पहले से कम',
    movementConcerned: 'चिंताजनक',
    symptomNotePlaceholder: 'टिप्पणी: उदा. चलने पर कमर में दर्द, हल्का सिरदर्द...',
    saveDailyCheckin: 'आज की जांच सुरक्षित करें',
    savingCheckin: 'सुरक्षित हो रहा है...',
    checkinSavedSuccess: 'जांच सफलतापूर्वक सुरक्षित हो गई!',
    safetyTriageBtn: 'लक्षण जांच',
    medicalReportsBtn: 'मेडिकल रिपोर्ट',
    askMomCareBtn: 'मॉमकेयर से पूछें',
    askMomCareDesc: 'आपकी गर्भावस्था के हफ्ते और सेहत के अनुसार जवाब देता है।',

    // Triage & Emergency (Hardcoded)
    knowMyDate: 'मुझे तारीख पता है →',
    symptomTriageTitle: 'सुरक्षा और लक्षण जांच',
    symptomTriageSubtitle: 'डॉक्टरी सुरक्षा नियम और व्यक्तिगत मार्गदर्शन',
    protocolLevelsTitle: 'सुरक्षा के स्तर:',
    protocolRoutine: 'सामान्य',
    protocolRoutineDesc: 'गर्भावस्था में सामान्य लक्षण। आराम और घरेलू देखभाल पर्याप्त है।',
    protocolAttention: 'ध्यान देने योग्य',
    protocolAttentionDesc: 'बार-बार होने वाला लक्षण। डॉक्टर से अगली जांच में चर्चा करें।',
    protocolUrgent: 'आपातकालीन चेतावनी',
    protocolUrgentDesc: 'तुरंत डॉक्टर से संपर्क या अस्पताल जाने की आवश्यकता।',
    whatSymptomQuestion: 'आप शरीर में क्या महसूस कर रही हैं?',
    symptomPlaceholder: 'उदा. कमर में दर्द, जी मिचलाना, सिरदर्द...',
    severityLabel: 'तीव्रता',
    severityMild: 'हल्का',
    severityModerate: 'मध्यम',
    severitySevere: 'गंभीर',
    durationLabel: 'कितने समय से?',
    durationJustStarted: 'अभी शुरू हुआ',
    durationFewHours: 'कुछ घंटों से',
    duration1to2Days: '1-2 दिनों से',
    durationOverWeek: 'एक हफ्ते से अधिक',
    locationLabel: 'शरीर का कौन सा हिस्सा?',
    assessBtn: 'लक्षण की जांच करें',
    assessingBtn: 'जांच हो रही है...',
    whatThisMeans: 'इसका क्या अर्थ है?',
    whatToDoNow: 'अभी क्या करना चाहिए?',
    whenToContactDoctor: 'डॉक्टर से कब संपर्क करें?',
    watchForSigns: 'किन खतरों पर नजर रखें',
    evidenceSources: 'चिकित्सीय दिशा-निर्देश प्रमाण',
    disclaimerText: 'मॉमकेयर केवल जानकारी और शुरुआती चेतावनी देता है। यह डॉक्टर की जांच या इलाज का विकल्प नहीं है। आपात स्थिति में तुरंत डॉक्टर या 108 पर कॉल करें।',
    redEmergencyTitle: 'आपातकालीन चेतावनी — तुरंत ध्यान दें!',
    redEmergencyMessage: 'तुरंत डॉक्टर की सहायता की आवश्यकता है! बिना देर किए तुरंत अपने डॉक्टर को कॉल करें या 108 एम्बुलेंस बुलाएं।',
    callDoctorBtn: 'डॉक्टर को कॉल करें',
    callAmbulanceBtn: '108 एम्बुलेंस बुलाएं',
    callFamilyBtn: 'परिवार को कॉल करें',

    // Profile & Settings
    profileTitle: 'प्रोफ़ाइल और सेटिंग्स',
    personalInfo: 'व्यक्तिगत जानकारी',
    emergencyContactsTeam: 'आपातकालीन संपर्क',
    healthBaselineTitle: 'स्वास्थ्य रिकॉर्ड',
    saveChanges: 'बदलाव सुरक्षित करें',
    savingChanges: 'सुरक्षित हो रहा है...',
    savedSuccess: 'सफलतापूर्वक सुरक्षित हो गया!',
    privacyDataControlTitle: 'आपकी जानकारी और सुरक्षा',
    privacyDataControlDesc: 'आपकी जानकारी पर आपका पूरा अधिकार है। आप अपना डेटा डाउनलोड कर सकती हैं या पूरी तरह हटा सकती हैं।',
    downloadMyData: 'मेरा डेटा डाउनलोड करें (.JSON)',
    deleteAccountData: 'खाता और डेटा मिटाएं',
    deleteConfirmTitle: 'क्या आप वाकई खाता मिटाना चाहती हैं?',
    deleteConfirmDesc: 'यह आपके सभी रिकॉर्ड स्थायी रूप से हटा देगा। इसे दोबारा वापस नहीं लाया जा सकेगा।',
    deleteConfirmBtn: 'हाँ, सब मिटा दें',
    cancelBtn: 'रद्द करें',
    logoutBtn: 'लॉग आउट (Log out)',

    // Navigation
    navHome: 'होम',
    navPregnancy: 'गर्भ',
    navCare: 'देखभाल',
    navCommunity: 'सहेलियां',
    navProfile: 'प्रोफ़ाइल',

    // Personal AI Companion Home Redesign
    howAreYouToday: 'आज आप कैसा महसूस कर रही हैं?',
    howAreYouSub: 'एक छोटा 30 सेकंड का चेक-इन आपकी और बच्चे की सुरक्षा सुनिश्चित करता है।',
    editCheckin: 'जांच बदलें ✏️',
    questionProgress: 'प्रश्न {current} में से {total}',
    skipQuestion: 'छोड़ें',
    checkinSummaryTitle: 'आपकी आज की जांच का सारांश',
    savedSuccessCheck: 'सुरक्षित हुआ ✓',
    tryAgainBtn: 'फिर कोशिश करें',
    personalAiInsightTitle: 'मॉमकेयर व्यक्तिगत सुझाव',
    whyAmISeeingThis: 'मुझे यह क्यों दिख रहा है?',
    dataUsedLabel: 'उपयोग किया गया विवरण:',
    profileLearningLabel: '7 में से {days} दिन का रिकॉर्ड दर्ज',
    profileLearningSub: 'जैसे-जैसे आप दैनिक रिकॉर्ड दर्ज करेंगी, सुझाव और अधिक सटीक होंगे।',
    trendSleep: 'नींद',
    trendEnergy: 'शरीर में ऊर्जा',
    trendMovement: 'शिशु की हलचल',
    trendBetter: 'बेहतर ↑',
    trendSame: 'स्थिर →',
    trendLower: 'कम ↓',
    loadingInsightMsg1: 'पिछले 7 दिनों के रिकॉर्ड देख रहे हैं...',
    loadingInsightMsg2: 'आपकी नींद और ऊर्जा की जांच कर रहे हैं...',
    loadingInsightMsg3: 'आपके लिए व्यक्तिगत सुझाव तैयार कर रहे हैं...',
    todaysFocusTitle: 'आज का मुख्य ध्यान',
    todaysFocusCount: '3 में से {completed} पूरे हुए',
    allTasksDone: 'आज के सभी लक्ष्य पूरे हुए! अपना बहुत अच्छा ख्याल रख रही हैं 🌸',
    smartNudgesTitle: 'महत्वपूर्ण याददाश्त',
    nudgeCheckin: 'आज आपने अभी तक चेक-इन नहीं किया है। 30 सेकंड में अपनी सेहत दर्ज करें।',
    nudgeMovement: '28वें हफ्ते के बाद: क्या आज शिशु की सक्रिय हलचल महसूस हुई? शांत मन से बाईं करवट लेटकर ध्यान दें।',
    nudgeWater: 'पानी पिएं: अभी एक गिलास ताजा पानी जरूर पिएं।',
    nudgeAppt: 'आगामी डॉक्टर जांच: डॉक्टर से पूछने वाले सवाल अभी से नोट कर लें।',
    knowYouBetterTitle: 'हमें आपको बेहतर समझने में मदद करें',
    skipForNow: 'बाद में',
    saveAnswer: 'सुरक्षित करें',
    askMomCareShortcutsTitle: 'मॉमकेयर से पूछें',
    askMomCareShortcutsSub: 'आपकी वर्तमान स्थिति के अनुसार तैयार प्रश्न (टैप करें):',
    weeklySnapshotTitle: 'साप्ताहिक विकास झलक',
    viewFullStory: 'पूरे हफ्ते की जानकारी देखें →',
    homeDisclaimerNote: 'मॉमकेयर केवल जानकारी और शुरुआती चेतावनी देता है। यह डॉक्टर की जांच नहीं है। आपात स्थिति में तुरंत डॉक्टर या 108 पर संपर्क करें।',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: TRANSLATIONS.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('momcare_preferred_language') as Language;
      if (saved && (saved === 'en' || saved === 'ta' || saved === 'hi')) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('momcare_preferred_language', lang);
    } catch {}
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
