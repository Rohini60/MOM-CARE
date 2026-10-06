export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  preferredName?: string | null;
  communityAnonymous: boolean;
  age?: number | null;
  dueDate: string;
  pregnancyStartDate?: string | null;
  firstPregnancy: boolean;
  pastPregnanciesCount?: number | null;
  babyNickname?: string | null;
  medicalConditions?: string[]; // Gestational Diabetes, Hypertension, Thyroid, Preeclampsia History, None
  medicalHistoryNotes?: string | null;
  allergies?: string | null;
  userMedications?: string | null;
  currentSymptomsList?: string[];
  doctorName?: string | null;
  doctorPhone?: string | null;
  clinicName?: string | null;
  emergencyContact?: string | null;
  familyContactName?: string | null;
  familyContactPhone?: string | null;
  preferredLanguage?: 'en' | 'ta' | 'hi';
  consentGiven?: boolean;
  consentDate?: string | null;
  saveAiHistory: boolean;
  onboardingCompleted?: boolean;
  isDemoUser?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Checkin {
  id: string;
  userId: string;
  week: number;
  mood: 'great' | 'good' | 'okay' | 'not_great' | 'worried';
  energy: 'low' | 'normal' | 'high';
  sleep: 'poor' | 'okay' | 'good';
  babyMovement: 'normal' | 'less' | 'concerned' | 'not_felt_yet';
  discomfortLocations?: string[]; // Lower back, Abdomen/pelvis, Head/temples, Legs/feet, Ribs/chest, Pelvic girdle
  painLevel?: number; // 0 - 5
  symptoms?: string;
  notes?: string;
  createdAt: string;
}

export interface SymptomRecord {
  id: string;
  userId: string;
  week: number;
  symptomName: string;
  description?: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration?: string;
  location?: string;
  riskLevel: 'green' | 'yellow' | 'red';
  riskTitle?: string;
  aiSummary?: string;
  whatToDoNow?: string;
  watchFor?: string;
  whenToContact?: string;
  sources?: string[];
  createdAt: string;
}

export interface SymptomPatternAlert {
  symptomName: string;
  occurrenceCount: number;
  windowDays: number;
  firstLoggedDate: string;
  lastLoggedDate: string;
  clinicalAdvice: string;
  severity: 'mild' | 'moderate' | 'high';
  providerReviewAdvised: boolean;
}

export interface WombVisualization {
  week: number;
  imageUrl: string;
  description: string;
  lightingTheme: string;
  fetalPose: string;
  amnioticEnvironment: string;
  growthComparison: string;
}

export interface CareTask {
  id: string;
  userId: string;
  title: string;
  category: 'wellness' | 'medical' | 'hydration' | 'movement' | 'mental';
  completed: boolean;
  dueDate?: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  doctor?: string;
  clinic?: string;
  date: string;
  time?: string;
  notes?: string;
  completed: boolean;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  reminderTime?: string;
}

export interface MedicalReport {
  id: string;
  userId: string;
  reportName: string;
  reportDate: string;
  reportType: 'Ultrasound Scan' | 'Blood Work / Lab' | 'Genetic Screening' | 'Glucose Tolerance' | 'Clinical Notes';
  fileUrl?: string;
  aiSummary: string;
  plainLanguageExplanation: string;
  keyValues: Array<{ metric: string; value: string; interpretation: string }>;
  questionsForDoctor: string[];
  createdAt: string;
}

export interface AiConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  riskLevel?: 'green' | 'yellow' | 'red' | 'none';
  sources?: string[];
  contextNotes?: string;
  timestamp: string;
}

export type CommunityTopic =
  | 'Baby movement'
  | 'Sleep'
  | 'Food'
  | 'Emotional wellbeing'
  | 'Appointments'
  | 'Preparing for baby'
  | 'General experiences';

export interface CommunityPost {
  id: string;
  authorId: string;
  authorDisplayName: string;
  authorRole?: string;
  week: number;
  topic: CommunityTopic;
  title: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  isLikedByMe?: boolean;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorDisplayName: string;
  content: string;
  createdAt: string;
}

export interface PregnancyWeekData {
  week: number;
  trimester: 1 | 2 | 3;
  fruitComparison: string;
  approxLength: string;
  approxWeight: string;
  babyHighlights: string[];
  motherChanges: string[];
  careFocus: string[];
  doctorQuestions: string[];
  sources: string[];
}
